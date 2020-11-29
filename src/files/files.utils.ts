import { DiskStorageOptions } from 'multer';

export const nameUploadedFile: DiskStorageOptions['filename'] = (
  _,
  file,
  cb,
) => {
  const splittedFilename = file.originalname.split('.');
  const ext = splittedFilename[splittedFilename.length - 1];
  const name =
    splittedFilename.length > 2
      ? splittedFilename.slice(0, -1).join('.')
      : splittedFilename[0];
  const [month, day, year] = new Date().toLocaleDateString('en-US').split('/');
  const date = [year, month, day].join('-');

  cb(null, `${date}-${name}-${Date.now()}.${ext}`);
};
