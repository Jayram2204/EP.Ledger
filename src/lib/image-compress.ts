import imageCompression from 'browser-image-compression';

export async function compressImage(file: File): Promise<File> {
  const options = {
    maxWidthOrHeight: 1200,
    useWebWorker: true,
    initialQuality: 0.8,
  };
  
  return imageCompression(file, options);
}
