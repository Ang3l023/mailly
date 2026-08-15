import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  CopyObjectCommand,
  S3Client,
  S3ServiceException,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  FileNotFoundError,
  FileStorageError,
  FileStorageUnavailableError,
  FileValidationError,
} from './errors/file-storage.errors';

import {
  ListFilesOptions,
  UploadFileOptions,
} from './interfaces/file-storage.interface';
import { IConfigSchema } from '../../common/interfaces/config.interface';

@Injectable()
export class FileStorageService {
  private readonly logger = new Logger(FileStorageService.name);

  private readonly client: S3Client;
  private readonly bucket: string;

  private readonly maxFileSize: number;

  private readonly allowedMimeTypes: Set<string>;

  constructor(private readonly configService: ConfigService<IConfigSchema>) {
    this.bucket = this.configService.getOrThrow<string>('aws.s3.bucketName', {
      infer: true,
    });

    this.maxFileSize = Number(
      this.configService.get<number>('aws.s3.maxFileSize', { infer: true }),
    );

    const allowedMimeTypes = this.configService.getOrThrow<string>(
      'aws.s3.allowedMimeTypes',
      { infer: true },
    );

    this.allowedMimeTypes = new Set(
      allowedMimeTypes
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
    );

    this.client = new S3Client({
      region: this.configService.getOrThrow<string>('aws.s3.region', {
        infer: true,
      }),

      endpoint: this.configService.getOrThrow<string>('aws.s3.endpoint', {
        infer: true,
      }),

      credentials: {
        accessKeyId: this.configService.getOrThrow<string>(
          'aws.s3.accessKeyId',
          { infer: true },
        ),

        secretAccessKey: this.configService.getOrThrow<string>(
          'aws.s3.secretAccessKey',
          { infer: true },
        ),
      },

      forcePathStyle: this.configService.get('aws.s3.forcePathStyle', {
        infer: true,
      }),
    });
  }

  // ============================================================
  // UPLOAD
  // ============================================================

  async upload(options: UploadFileOptions) {
    this.validateKey(options.key);
    this.validateBody(options.body);
    this.validateContentType(options.contentType);

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: options.key,
          Body: options.body,
          ContentType: options.contentType,
          Metadata: options.metadata,
          CacheControl: options.cacheControl,
        }),
      );

      this.logger.log(`File uploaded: ${options.key}`);

      return {
        key: options.key,
        bucket: this.bucket,
        size: options.body.length,
        contentType: options.contentType,
      };
    } catch (error) {
      this.handleStorageError(error, `upload ${options.key}`);
    }
  }

  // ============================================================
  // GET
  // ============================================================

  async get(key: string) {
    this.validateKey(key);

    try {
      return await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
    } catch (error) {
      this.handleGetError(error, key);
    }
  }

  // ============================================================
  // GET STRING BUFFER
  // ============================================================

  async getStringBuffer(key: string): Promise<string> {
    const response = await this.get(key);

    if (!response.Body) {
      throw new FileNotFoundError(key);
    }

    try {
      return await response.Body.transformToString();
    } catch (error) {
      this.logger.error(`Failed to read file body: ${key}`, error);

      throw new FileStorageError(
        `Unable to read file: ${key}`,
        'FILE_READ_ERROR',
        error,
      );
    }
  }

  // ============================================================
  // GET BUFFER
  // ============================================================

  async getBuffer(key: string): Promise<Buffer> {
    const response = await this.get(key);

    if (!response.Body) {
      throw new FileNotFoundError(key);
    }

    try {
      return Buffer.from(await response.Body.transformToByteArray());
    } catch (error) {
      this.logger.error(`Failed to read file body: ${key}`, error);

      throw new FileStorageError(
        `Unable to read file: ${key}`,
        'FILE_READ_ERROR',
        error,
      );
    }
  }

  // ============================================================
  // METADATA
  // ============================================================

  async getMetadata(key: string) {
    this.validateKey(key);

    try {
      const response = await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );

      return {
        key,
        size: response.ContentLength ?? 0,
        contentType: response.ContentType,
        contentLength: response.ContentLength,
        etag: response.ETag,
        lastModified: response.LastModified,
        metadata: response.Metadata,
      };
    } catch (error) {
      this.handleGetError(error, key);
    }
  }

  // ============================================================
  // EXISTS
  // ============================================================

  async exists(key: string): Promise<boolean> {
    this.validateKey(key);

    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );

      return true;
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return false;
      }

      this.handleStorageError(error, `check existence ${key}`);
    }
  }

  // ============================================================
  // LIST
  // ============================================================

  async list(options: ListFilesOptions = {}) {
    const { prefix, maxKeys = 1000 } = options;

    if (prefix) {
      this.validateKey(prefix);
    }

    if (!Number.isInteger(maxKeys) || maxKeys < 1 || maxKeys > 1000) {
      throw new FileValidationError('maxKeys must be between 1 and 1000');
    }

    try {
      const response = await this.client.send(
        new ListObjectsV2Command({
          Bucket: this.bucket,
          Prefix: prefix,
          MaxKeys: maxKeys,
        }),
      );

      return {
        files:
          response.Contents?.map((object) => ({
            key: object.Key,
            size: object.Size,
            etag: object.ETag,
            lastModified: object.LastModified,
          })) ?? [],

        isTruncated: response.IsTruncated ?? false,

        nextContinuationToken: response.NextContinuationToken,
      };
    } catch (error) {
      this.handleStorageError(error, 'list files');
    }
  }

  // ============================================================
  // DELETE
  // ============================================================

  async delete(key: string) {
    this.validateKey(key);

    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );

      this.logger.log(`File deleted: ${key}`);

      return {
        key,
        deleted: true,
      };
    } catch (error) {
      this.handleStorageError(error, `delete ${key}`);
    }
  }

  // ============================================================
  // DELETE MANY
  // ============================================================

  async deleteMany(keys: string[]) {
    if (!Array.isArray(keys)) {
      throw new FileValidationError('keys must be an array');
    }

    if (keys.length === 0) {
      return {
        deleted: [],
        errors: [],
      };
    }

    if (keys.length > 1000) {
      throw new FileValidationError(
        'Cannot delete more than 1000 files at once',
      );
    }

    keys.forEach((key) => this.validateKey(key));

    try {
      const response = await this.client.send(
        new DeleteObjectsCommand({
          Bucket: this.bucket,
          Delete: {
            Objects: keys.map((Key) => ({
              Key,
            })),
          },
        }),
      );

      return {
        deleted: response.Deleted ?? [],
        errors: response.Errors ?? [],
      };
    } catch (error) {
      this.handleStorageError(error, 'delete multiple files');
    }
  }

  // ============================================================
  // DOWNLOAD URL
  // ============================================================

  async getDownloadUrl(key: string, expiresIn = 3600) {
    this.validateKey(key);
    this.validateExpiration(expiresIn);

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      return await getSignedUrl(this.client, command, {
        expiresIn,
      });
    } catch (error) {
      this.handleStorageError(error, `generate download URL ${key}`);
    }
  }

  // ============================================================
  // UPLOAD URL
  // ============================================================

  async getUploadUrl(key: string, contentType: string, expiresIn = 900) {
    this.validateKey(key);
    this.validateContentType(contentType);
    this.validateExpiration(expiresIn);

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: contentType,
      });

      return await getSignedUrl(this.client, command, {
        expiresIn,
      });
    } catch (error) {
      this.handleStorageError(error, `generate upload URL ${key}`);
    }
  }

  // ============================================================
  // COPY
  // ============================================================

  async copy(sourceKey: string, destinationKey: string) {
    this.validateKey(sourceKey);
    this.validateKey(destinationKey);

    try {
      await this.client.send(
        new CopyObjectCommand({
          Bucket: this.bucket,
          Key: destinationKey,
          CopySource: `${this.bucket}/${sourceKey}`,
        }),
      );

      return {
        sourceKey,
        destinationKey,
      };
    } catch (error) {
      this.handleStorageError(error, `copy ${sourceKey}`);
    }
  }

  // ============================================================
  // MOVE
  // ============================================================

  async move(sourceKey: string, destinationKey: string) {
    await this.copy(sourceKey, destinationKey);

    await this.delete(sourceKey);

    return {
      sourceKey,
      destinationKey,
    };
  }

  // ============================================================
  // VALIDATIONS
  // ============================================================

  private validateKey(key: string) {
    if (!key || typeof key !== 'string') {
      throw new FileValidationError('File key is required');
    }

    if (key.length > 1024) {
      throw new FileValidationError('File key cannot exceed 1024 characters');
    }

    if (key.startsWith('/')) {
      throw new FileValidationError('File key cannot start with "/"');
    }

    if (key.includes('..')) {
      throw new FileValidationError('File key cannot contain ".."');
    }

    if (key.includes('\0') || key.includes('\\')) {
      throw new FileValidationError('File key contains invalid characters');
    }
  }

  private validateBody(body: Buffer) {
    if (!Buffer.isBuffer(body)) {
      throw new FileValidationError('File body must be a Buffer');
    }

    if (body.length === 0) {
      throw new FileValidationError('File cannot be empty');
    }

    if (body.length > this.maxFileSize) {
      throw new FileValidationError(
        `File exceeds maximum size of ${this.maxFileSize} bytes`,
      );
    }
  }

  private validateContentType(contentType: string) {
    if (!contentType) {
      throw new FileValidationError('Content type is required');
    }

    if (
      this.allowedMimeTypes.size > 0 &&
      !this.allowedMimeTypes.has(contentType)
    ) {
      throw new FileValidationError(`Content type not allowed: ${contentType}`);
    }
  }

  private validateExpiration(expiresIn: number) {
    if (!Number.isInteger(expiresIn) || expiresIn < 1 || expiresIn > 86400) {
      throw new FileValidationError(
        'Expiration must be between 1 second and 24 hours',
      );
    }
  }

  // ============================================================
  // ERROR HANDLING
  // ============================================================

  private isNotFoundError(error: unknown): boolean {
    if (error instanceof S3ServiceException) {
      return (
        error.name === 'NotFound' ||
        error.name === 'NoSuchKey' ||
        error.$metadata?.httpStatusCode === 404
      );
    }

    return false;
  }

  private handleGetError(error: unknown, key: string): never {
    if (this.isNotFoundError(error)) {
      throw new FileNotFoundError(key, error);
    }

    this.handleStorageError(error, `get ${key}`);
  }

  private handleStorageError(error: unknown, operation: string): never {
    this.logger.error(
      `Storage operation failed: ${operation}`,
      error instanceof Error ? error.stack : String(error),
    );

    if (error instanceof FileStorageError) {
      throw error;
    }

    if (error instanceof S3ServiceException) {
      const status = error.$metadata?.httpStatusCode;

      if (status === 404 || error.name === 'NoSuchKey') {
        throw new FileStorageError('File not found', 'FILE_NOT_FOUND', error);
      }

      if (status === 401 || status === 403) {
        throw new FileStorageError(
          'Storage authentication failed',
          'STORAGE_AUTHENTICATION_ERROR',
          error,
        );
      }

      if (status && status >= 500) {
        throw new FileStorageUnavailableError(error);
      }
    }

    throw new FileStorageError(
      `Storage operation failed: ${operation}`,
      'STORAGE_ERROR',
      error,
    );
  }
}
