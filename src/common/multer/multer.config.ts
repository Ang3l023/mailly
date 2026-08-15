// src/common/multer/multer.config.ts

import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { homedir } from 'os';

/**
 * Construye una ruta absoluta multiplataforma
 * Ejemplo: Desktop/plantillas → /Users/xxx/Desktop/plantillas  o  C:\Users\xxx\Desktop\plantillas
 */
export function buildUploadPath(relativePath: string): string {
  // Si la ruta ya es absoluta, la usamos tal cual
  if (relativePath.startsWith('/') || /^[A-Za-z]:[\\/]/.test(relativePath)) {
    return relativePath;
  }

  // Si no, la construimos desde el home del usuario
  return join(homedir(), relativePath);
}

/**
 * Crea una configuración de Multer dinámica según la variable de entorno
 * @param configService ConfigService de NestJS
 * @param envKey Nombre de la variable de entorno (ej: 'TEMPLATES_UPLOAD_PATH')
 * @param allowedMimeTypes Tipos MIME permitidos (opcional)
 * @param maxSizeMB Tamaño máximo en MB (opcional)
 */
export const createMulterConfig = (
  configService: ConfigService,
  envKey: string,
  allowedMimeTypes: string[] = ['text/html'],
  maxSizeMB = 10,
) => {
  // Leer la ruta desde el .env (puede ser relativa o absoluta)
  const envPath = configService.get<string>(envKey);

  if (!envPath) {
    throw new Error(`La variable de entorno ${envKey} no está definida`);
  }

  // Convertir a ruta absoluta multiplataforma
  const uploadPath = buildUploadPath(envPath);

  console.log(`📁 Plantillas se guardarán en: ${uploadPath}`);

  // Crear carpeta si no existe
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  return {
    storage: diskStorage({
      destination: (
        req: Request,
        file: Express.Multer.File,
        cb: (error: Error | null, destination: string) => void,
      ) => {
        cb(null, uploadPath);
      },
      filename: (
        req: Request,
        file: Express.Multer.File,
        cb: (error: Error | null, filename: string) => void,
      ) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
      },
    }),
    limits: {
      fileSize: maxSizeMB * 1024 * 1024,
    },
    fileFilter: (
      req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, acceptFile: boolean) => void,
    ) => {
      const isAllowed =
        allowedMimeTypes.includes(file.mimetype) ||
        allowedMimeTypes.some((type) =>
          file.originalname.toLowerCase().endsWith(type.replace('text/', '.')),
        );

      if (isAllowed) {
        cb(null, true);
      } else {
        cb(
          new Error(
            `Forbidden formats. Only allowed: ${allowedMimeTypes.join(', ')}`,
          ),
          false,
        );
      }
    },
  };
};
