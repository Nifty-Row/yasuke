import { ImageService } from '../services/image.service';
import { Controller } from '@nestjs/common';

@Controller('photos')
export class PhotoController {
  constructor(private imageService: ImageService) {}
}
