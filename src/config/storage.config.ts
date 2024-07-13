import getEnvVar from 'env/index';

const StorageConfig = {
  fileLocation: (userId: string) => `${getEnvVar('STORAGE_PATH')}/${userId}/`,
  maxFileSize: 25 * 1000000,
  maxVideoDuration: 25,
  minVideoDuration: 5,
  relativeFileLocation: (userId: string, filename: string) => `/${userId}/${filename}`,
};

export default StorageConfig;
