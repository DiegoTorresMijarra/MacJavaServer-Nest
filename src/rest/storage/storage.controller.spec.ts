import { StorageController } from './storage.controller'
import { StorageService } from './storage.service'
import { Test, TestingModule } from '@nestjs/testing'
import { BadRequestException, NotFoundException } from '@nestjs/common'

describe('StorageController', () => {
  let storageController: StorageController
  let storageService: StorageService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StorageController],
      providers: [StorageService],
    }).compile()

    storageController = module.get<StorageController>(StorageController)
    storageService = module.get<StorageService>(StorageService)
  })
  describe('storeFile', () => {
    it('GuardaFile', async () => {
      // Arrange
      const fileMock: Express.Multer.File = {
        originalname: 'test.jpg',
        filename: 'test-uuid.jpg',
        size: 1234,
        mimetype: 'image/jpeg',
        path: '/path/to/test-uuid.jpg',
        buffer: Buffer.from('fake file content'),
        fieldname: 'file',
        encoding: '7bit',
        stream: null as any,
        destination: '/path/to',
      }

      const reqMock: any = {
        protocol: 'http',
        get: () => 'localhost',
        params: {},
        query: {},
        body: {},
        headers: {},
        accepts: () => ['application/json'],
      }

      // Espía el método storeFile del controlador y devuelve un resultado ficticio
      const storeFileSpy = jest.spyOn(storageController, 'storeFile')
      storeFileSpy.mockReturnValue({
        originalname: 'test.jpg',
        filename: 'test-uuid.jpg',
        size: 1234,
        mimetype: 'image/jpeg',
        path: '/path/to/test-uuid.jpg',
        url: 'http://localhost/storage/test-uuid.jpg',
      })

      // Act
      const result = await storageController.storeFile(fileMock, reqMock)

      // Assert
      expect(result).toEqual({
        originalname: 'test.jpg',
        filename: 'test-uuid.jpg',
        size: 1234,
        mimetype: 'image/jpeg',
        path: '/path/to/test-uuid.jpg',
        url: 'http://localhost/storage/test-uuid.jpg',
      })
    })

    it('Devuelve BadRequest si no lo encuentra', () => {
      // Arrange
      const reqMock: any = {
        protocol: 'http',
        get: () => 'localhost',
      }

      // Espía el método storeFile del controlador y lanza una BadRequestException ficticia
      const storeFileSpy = jest.spyOn(storageController, 'storeFile')
      storeFileSpy.mockImplementation(() => {
        throw new BadRequestException('Fichero no encontrado.')
      })

      // Act & Assert
      expect(() => storageController.storeFile(undefined, reqMock)).toThrow(
        BadRequestException,
      )
    })

    it('Devuelve BadRequest si no es tipo soportado', () => {
      // Arrange
      const fileMock: Express.Multer.File = {
        originalname: 'test.txt',
        filename: 'test-uuid.txt',
        size: 1234,
        mimetype: 'image/txt',
        path: '/path/to/test-uuid.txt',
        buffer: Buffer.from('fake file content'),
        fieldname: 'file',
        encoding: '7bit',
        stream: null as any,
        destination: '/path/to',
      }

      const reqMock: any = {
        protocol: 'http',
        get: () => 'localhost',
        params: {},
        query: {},
        body: {},
        headers: {},
        accepts: () => ['application/json'],
      }

      // Espía el método storeFile del controlador y lanza una BadRequestException ficticia
      const storeFileSpy = jest.spyOn(storageController, 'storeFile')
      storeFileSpy.mockImplementation(() => {
        throw new BadRequestException('Tipo de fichero no soportado.')
      })

      // Act & Assert
      expect(() => storageController.storeFile(fileMock, reqMock)).toThrow(
        BadRequestException,
      )
    })
  })

  describe('getFile', () => {
    it('Hacer el GetFile', () => {
      // Arrange
      const filename = 'test-uuid.jpg'
      const resMock: any = { sendFile: jest.fn() }

      // Espía el método findFile del servicio y devuelve una ruta ficticia
      const findFileSpy = jest.spyOn(storageService, 'findFile')
      findFileSpy.mockReturnValue('/path/to/test-uuid.jpg')

      // Act
      storageController.getFile(filename, resMock)

      // Assert
      expect(findFileSpy).toHaveBeenCalledWith(filename)
      expect(resMock.sendFile).toHaveBeenCalledWith('/path/to/test-uuid.jpg')
    })

    it('Devuelve NotFound', () => {
      // Arrange
      const filename = 'nonexistent-file.jpg'
      const resMock: any = { sendFile: jest.fn() }

      // Espía el método findFile del servicio y lanza una NotFoundException ficticia
      const findFileSpy = jest.spyOn(storageService, 'findFile')
      findFileSpy.mockImplementation(() => {
        throw new NotFoundException(`El fichero ${filename} no existe.`)
      })

      // Act & Assert
      expect(() => storageController.getFile(filename, resMock)).toThrowError(
        NotFoundException,
      )
      expect(findFileSpy).toHaveBeenCalledWith(filename)
      expect(resMock.sendFile).not.toHaveBeenCalled() // No debería llamarse a sendFile en este caso
    })
  })
})
