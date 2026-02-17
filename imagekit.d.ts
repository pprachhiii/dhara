declare module 'imagekit' {
  interface UploadResult {
    fileId: string;
    name: string;
    url: string;
    thumbnail_url?: string;
    [key: string]: unknown;
  }

  interface UploadOptions {
    file: string | Buffer | File; // allow browser File
    fileName: string;
    folder?: string;
    [key: string]: unknown;
  }

  type UploadCallback = (error: Error | null, result?: UploadResult) => void;

  class ImageKit {
    constructor(options: { publicKey: string; privateKey: string; urlEndpoint: string });
    upload(options: UploadOptions, callback: UploadCallback): void;
  }

  export default ImageKit;
}
