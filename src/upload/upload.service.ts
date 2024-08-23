import { Injectable } from '@nestjs/common';
import { join, resolve } from 'path';
import { promises as fs } from 'fs';

@Injectable()
export class UploadService {
  private readonly uploadPath = join(__dirname, '..', '..', '..', 'uploads');

  constructor() {
    this.ensureUploadsFolderExists();
  }

  private async ensureUploadsFolderExists() {
    try {
      await fs.access(this.uploadPath);
    } catch (error) {
      await fs.mkdir(this.uploadPath, { recursive: true });
    }
  }

  private async ensureFolderExists(path: string) {
    try {
      await fs.access(path);
    } catch (error) {
      await fs.mkdir(path, { recursive: true });
    }
  }



  private async getEmpresaFolderPath(empresaId: string): Promise<string> {
    const folders = await fs.readdir(this.uploadPath, { withFileTypes: true });
    const folderToUpdate = folders.find(
      (folder) => folder.isDirectory() && folder.name.includes(`EMPRESA-ID${empresaId}`)
    );

    if (folderToUpdate) {
      return join(this.uploadPath, folderToUpdate.name);
    } else {
      const newFolderPath = join(this.uploadPath, `EMPRESA-ID${empresaId}`);
      await this.ensureFolderExists(newFolderPath);
      return newFolderPath;
    }
  }


  private async updateEmpresaFolderName(empresaId: string, newEmpresaName: string): Promise<string | null> {
    const empresaFolderPath = await this.getEmpresaFolderPath(empresaId);
    if (empresaFolderPath) {
      const newEmpresaFolderPath = join(this.uploadPath, `EMPRESA-ID${empresaId}-${newEmpresaName}`);
      await fs.rename(empresaFolderPath, newEmpresaFolderPath);
      return newEmpresaFolderPath;
    }
    return null;
  }

  private async getCardFolderPath(empresaId: string, empresaName: string, cardId: string, userId: string, clientName: string): Promise<string> {
    let empresaFolderPath = await this.getEmpresaFolderPath(empresaId);
    if (!empresaFolderPath) {
      empresaFolderPath = join(this.uploadPath, `EMPRESA-ID${empresaId}-${empresaName}`);
      await this.ensureFolderExists(empresaFolderPath);
    } else {
      const updatedEmpresaFolderPath = await this.updateEmpresaFolderName(empresaId, empresaName);
      if (updatedEmpresaFolderPath) {
        empresaFolderPath = updatedEmpresaFolderPath;
      }
    }

    const cardFolderPath = join(empresaFolderPath, `CARD-ID${cardId}-USER-ID${userId}-${clientName}`);
    await this.ensureFolderExists(cardFolderPath);

    return cardFolderPath;
  }

  private async updateClientFolderName(basePath: string, cardId: string, newClientName: string): Promise<string | null> {
    const folders = await fs.readdir(basePath, { withFileTypes: true });
    const folderToUpdate = folders.find(
      (folder) => folder.isDirectory() && folder.name.includes(`CARD-ID${cardId}`)
    );

    if (folderToUpdate) {
      const oldPath = join(basePath, folderToUpdate.name);
      const newPath = join(basePath, `CARD-ID${cardId}-USER-ID${folderToUpdate.name.split('-USER-ID')[1].split('-')[0]}-${newClientName}`);
      await fs.rename(oldPath, newPath);
      return newPath;
    }

    return null;
  }


  async saveFile(file: Express.Multer.File, empresaId: string, empresaName: string, cardId: string, userId: string, clientName: string): Promise<string> {
    let empresaFolderPath = await this.updateEmpresaFolderName(empresaId, empresaName) || await this.getEmpresaFolderPath(empresaId) || join(this.uploadPath, `EMPRESA-ID${empresaId}-${empresaName}`);
    await this.ensureFolderExists(empresaFolderPath);

    let cardFolderPath = await this.updateClientFolderName(empresaFolderPath, cardId, clientName);
    if (!cardFolderPath) {
      cardFolderPath = await this.getCardFolderPath(empresaId, empresaName, cardId, userId, clientName);
    }

    const filePath = join(cardFolderPath, file.originalname);
    await fs.writeFile(filePath, file.buffer);
    return filePath;
  }



  async getFilePath(empresaId: string, cardId: string, userId: string, clientName: string, fileName: string): Promise<string> {
    if (!empresaId || !cardId || !userId || !clientName) {
      throw new Error('Missing required parameters');
    }
  
    // Buscar a pasta da empresa
    const empresaFolders = await fs.readdir(this.uploadPath, { withFileTypes: true });
    const empresaFolder = empresaFolders.find(folder => folder.isDirectory() && folder.name.startsWith(`EMPRESA-ID${empresaId}`));
  
    if (!empresaFolder) {
      throw new Error('Empresa folder not found');
    }
  
    const empresaFolderPath = resolve(this.uploadPath, empresaFolder.name);
  
    // Buscar a pasta do card
    const cardFolders = await fs.readdir(empresaFolderPath, { withFileTypes: true });
    const cardFolder = cardFolders.find(folder => folder.isDirectory() && folder.name.startsWith(`CARD-ID${cardId}`));
  
    if (!cardFolder) {
      throw new Error('Card folder not found');
    }
  
    const cardFolderPath = resolve(empresaFolderPath, cardFolder.name);
  
    // Construir o caminho completo do arquivo
    const filePath = resolve(cardFolderPath, fileName);
    return filePath;
  }





  async listFiles(empresaId: string): Promise<string[]> {
    const empresaFolderPath = await this.getEmpresaFolderPath(empresaId);
    try {
      const files = await fs.readdir(empresaFolderPath);
      return files;
    } catch (error) {
      console.error(`Error listing files: ${error.message}`);
      throw error;
    }
  }

  async deleteFile(empresaId: string, cardId: string, userId: string, clientName: string, fileName: string): Promise<void> {
    const empresaFolderPath = await this.getEmpresaFolderPath(empresaId);
    const cardFolderPath = await this.updateClientFolderName(empresaFolderPath, cardId, clientName) || await this.getCardFolderPath(empresaId, '', cardId, userId, clientName);
    const filePath = join(cardFolderPath, fileName);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      throw error;
    }
  }
}
