import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { promises as fs } from 'fs';

@Injectable()
export class UploadService {
  private readonly uploadPath = join(__dirname, '..', '..', 'uploads');

  constructor() {
    this.ensureUploadsFolderExists();
  }

  private async ensureUploadsFolderExists() {
    try {
      await fs.access(this.uploadPath);
      console.log(`Upload directory exists: ${this.uploadPath}`);
    } catch (error) {
      await fs.mkdir(this.uploadPath, { recursive: true });
      console.log(`Created upload directory: ${this.uploadPath}`);
    }
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    const filePath = join(this.uploadPath, file.originalname);
    await fs.writeFile(filePath, file.buffer);
    console.log(`File saved: ${filePath}`);
    return filePath;
  }

  async getFile(fileName: string): Promise<Buffer> {
    const filePath = join(this.uploadPath, fileName);
    console.log(`Reading file: ${filePath}`);
    return fs.readFile(filePath);
  }

  async listFiles(): Promise<string[]> {
    console.log(`Listing files in directory: ${this.uploadPath}`);
    try {
      const files = await fs.readdir(this.uploadPath);
      console.log(`Files found: ${files}`);
      return files;
    } catch (error) {
      console.error(`Error listing files: ${error.message}`);
      throw error;
    }
  }

  async findFile(fileName: string): Promise<string> {
    const filePath = join(this.uploadPath, fileName);
    try {
      await fs.access(filePath);
      console.log(`File found: ${filePath}`);
      return filePath;
    } catch (error) {
      console.error(`File not found: ${fileName}`);
      throw error;
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    const filePath = join(this.uploadPath, fileName);
    try {
      await fs.unlink(filePath);
      console.log(`File deleted: ${filePath}`);
    } catch (error) {
      console.error(`Error deleting file: ${fileName}`);
      throw error;
    }
  }
}
