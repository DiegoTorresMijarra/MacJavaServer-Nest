import { StorageService } from './storage.service'
import { Test, TestingModule } from '@nestjs/testing'
import * as fs from 'fs'
import { NotFoundException } from '@nestjs/common'
import * as path from 'path'

describe('StorageService', () => {
  let service: StorageService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StorageService],
    }).compile()

    service = module.get<StorageService>(StorageService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
  describe('findFile', () => {
    it('Encuentra el archivo', () => {
      const filename = 'example.jpg'
      const filePath = `${process.cwd()}${path.sep}storage-dir${path.sep}${filename}`

      jest.spyOn(fs, 'existsSync').mockReturnValue(true)

      const result = service.findFile(filename)

      expect(result).toEqual(filePath)
    })

    it('NotFound', () => {
      const filename = 'nonexistent.jpg'

      jest.spyOn(fs, 'existsSync').mockReturnValue(false)

      expect(() => service.findFile(filename)).toThrowError(NotFoundException)
    })
  })
  describe('getFileNameWithouUrl', () => {
    it('saca imagen del archivoURL', () => {
      const fileUrl = 'http://example.com/storage/filename.jpg'
      const result = service.getFileNameWithouUrl(fileUrl)
      expect(result).toEqual('filename.jpg')
    })

    it('Sin url', () => {
      const invalidUrl = 'not_a_url'
      const result = service.getFileNameWithouUrl(invalidUrl)
      expect(result).toEqual(invalidUrl)
    })
  })

  describe('removeFile', () => {
    it('elimina archivo', () => {
      const filename = 'example.jpg'
      const filePath = `${process.cwd()}${path.sep}storage-dir${path.sep}${filename}`

      jest.spyOn(fs, 'existsSync').mockReturnValue(true)
      jest.spyOn(fs, 'unlinkSync').mockReturnValue(undefined)

      expect(() => service.removeFile(filename)).not.toThrow()
    })

    it('NotFound', () => {
      const filename = 'nonexistent.jpg'

      jest.spyOn(fs, 'existsSync').mockReturnValue(false)

      expect(() => service.removeFile(filename)).toThrowError(NotFoundException)
    })
  })
})
