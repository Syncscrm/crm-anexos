


import { Controller, Post, UploadedFile, UseInterceptors, Get, Param, Res, Query, Delete, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { Response } from 'express';
import { Express } from 'express';

@Controller('uploads')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('empresaId') empresaId: string,
    @Body('empresaName') empresaName: string,
    @Body('cardId') cardId: string,
    @Body('userId') userId: string,
    @Body('clientName') clientName: string,
  ) {
    const filePath = await this.uploadService.saveFile(file, empresaId, empresaName, cardId, userId, clientName);
    return { filePath };
  }





  @Get(':fileName')
  async downloadFile(
    @Param('fileName') fileName: string,
    @Query('empresaId') empresaId: string,
    @Query('cardId') cardId: string,
    @Query('userId') userId: string,
    @Query('clientName') clientName: string,
    @Res() res: Response
  ) {
    try {
      if (!empresaId || !cardId || !userId || !clientName) {
        throw new Error('Missing required parameters');
      }
      const filePath = await this.uploadService.getFilePath(empresaId, cardId, userId, clientName, fileName);
      res.sendFile(filePath);
    } catch (error) {
      res.status(404).json({ message: 'File not found', error: error.message });
    }
  }
  



  @Get('list')
  async listFiles(
    @Query('empresaId') empresaId: string,
    @Res() res: Response
  ) {
    try {
      const files = await this.uploadService.listFiles(empresaId);
      res.status(200).json(files);
    } catch (error) {
      res.status(500).json({ message: 'Failed to list files', error: error.message });
    }
  }

  @Delete(':fileName')
  async deleteFile(
    @Param('fileName') fileName: string,
    @Query('empresaId') empresaId: string,
    @Query('cardId') cardId: string,
    @Query('userId') userId: string,
    @Query('clientName') clientName: string,
    @Res() res: Response
  ) {
    try {
      await this.uploadService.deleteFile(empresaId, cardId, userId, clientName, fileName);
      res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete file', error: error.message });
    }
  }
}
