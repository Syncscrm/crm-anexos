import { Controller, Post, UploadedFile, UseInterceptors, Get, Param, Res, Query, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { Response } from 'express';
import { Express } from 'express';

@Controller('uploads')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const filePath = await this.uploadService.saveFile(file);
    return { filePath };
  }


  @Get(':fileName') // Endpoint para baixar arquivos
  async downloadFile(@Param('fileName') fileName: string, @Res() res: Response) {
    try {
      const file = await this.uploadService.getFile(fileName);
      res.send(file);
    } catch (error) {
      res.status(404).json({ message: 'File not found', error: error.message });
    }
  }



  @Get('list')
  async listFiles(@Res() res: Response) {
    try {
      const files = await this.uploadService.listFiles();
      res.status(200).json(files);
    } catch (error) {
      res.status(500).json({ message: 'Failed to list files', error: error.message });
    }
  }

  @Get('find')
  async findFile(@Query('name') fileName: string, @Res() res: Response) {
    try {
      const filePath = await this.uploadService.findFile(fileName);
      res.status(200).json({ filePath });
    } catch (error) {
      res.status(404).json({ message: 'File not found', error: error.message });
    }
  }

  @Delete(':fileName')
  async deleteFile(@Param('fileName') fileName: string, @Res() res: Response) {
    try {
      await this.uploadService.deleteFile(fileName);
      res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete file', error: error.message });
    }
  }
}
