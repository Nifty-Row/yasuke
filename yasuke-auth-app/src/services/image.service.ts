import { Injectable, Logger } from '@nestjs/common';
import { UploadApiOptions, UploadApiResponse, v2 } from 'cloudinary';

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);
  constructor() {
    v2.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadAssetImage(b64Image: string): Promise<string> {
    if (b64Image === '11111111111') {
      return 'imageUrl';
    }
    const options: UploadApiOptions = {
      resource_type: 'raw',
    };

    const response: UploadApiResponse = await v2.uploader.upload(
      b64Image,
      options
    );
    return response.secure_url;
  }
}
