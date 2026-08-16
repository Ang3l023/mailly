import dayjs from 'dayjs';
import { basename } from 'path';

export const S3_PATH = {
  TEMPLATES: (clientId: number, filename: string) =>
    `templates/${clientId}/${filename}`,
  ATTACHMENTS_QUEUE: (filename: string) =>
    `queue/attachments/${dayjs().format('YYYY-MM-DD')}/${new Date().getTime()}-${filename}`,
};

export const S3_FILENAME_FROM_PATH = {
  ATTACHMENTS_QUEUE: (path: string) => {
    const fullFilename = basename(path);

    const separatorIndex = fullFilename.indexOf('-');
    if (separatorIndex !== -1) {
      return fullFilename.substring(separatorIndex + 1);
    }

    return fullFilename;
  },
};
