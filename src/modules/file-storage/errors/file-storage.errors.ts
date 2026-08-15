export class FileStorageError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: unknown,
  ) {
    super(message);

    this.name = 'FileStorageError';
  }
}

export class FileNotFoundError extends FileStorageError {
  constructor(key: string, cause?: unknown) {
    super(`File not found: ${key}`, 'FILE_NOT_FOUND', cause);
  }
}

export class FileValidationError extends FileStorageError {
  constructor(message: string) {
    super(message, 'FILE_VALIDATION_ERROR');
  }
}

export class FileStorageUnavailableError extends FileStorageError {
  constructor(cause?: unknown) {
    super(
      'File storage is currently unavailable',
      'FILE_STORAGE_UNAVAILABLE',
      cause,
    );
  }
}
