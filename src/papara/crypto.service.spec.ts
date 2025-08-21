import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CryptoService } from './crypto.service';
import crypto from 'crypto';

describe('CryptoService', () => {
  let service: CryptoService;
  const mockSecret = 'ABCD1234';

  // Mock ConfigService
  const mockConfigService = {
    get: jest.fn().mockImplementation((key) => {
      if (key === 'SECRET_KEY') return mockSecret;
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CryptoService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<CryptoService>(CryptoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('stringify', () => {
    it('should stringify an object with sorted keys', () => {
      const obj = { c: 'value3', a: 'value1', b: 'value2' };
      const result = service.stringify(obj);
      expect(result).toBe("{'a': 'value1', 'b': 'value2', 'c': 'value3'}");
    });

    it('should handle empty objects', () => {
      const obj = {};
      const result = service.stringify(obj);
      expect(result).toBe('{}');
    });

    it('should handle objects with numeric values', () => {
      const obj = { a: 123, b: 456 };
      const result = service.stringify(obj);
      expect(result).toBe("{'a': '123', 'b': '456'}");
    });

    it('should handle objects with boolean values', () => {
      const obj = { a: true, b: false };
      const result = service.stringify(obj);
      expect(result).toBe("{'a': 'true', 'b': 'false'}");
    });
  });

  describe('getApiSign', () => {
    it('should generate correct signature for simple object', () => {
      const payload = { a: 'value1', b: 'value2' };
      const values = ['value1', 'value2'];
      const signStr = mockSecret + values.join('');
      const expected = crypto
        .createHash('sha256')
        .update(signStr)
        .digest('hex');

      const result = service.getApiSign(payload);
      expect(result).toBe(expected);
    });

    it('should sort object keys before generating signature', () => {
      const payload = { c: 'value3', a: 'value1', b: 'value2' };
      const values = ['value1', 'value2', 'value3']; // Sorted by key
      const signStr = mockSecret + values.join('');
      const expected = crypto
        .createHash('sha256')
        .update(signStr)
        .digest('hex');

      const result = service.getApiSign(payload);
      expect(result).toBe(expected);
    });

    it('should handle nested objects', () => {
      const payload = {
        a: 'value1',
        b: { d: 'nested1', c: 'nested2' },
      };
      // The nested object should be stringified as "{'c': 'nested2', 'd': 'nested1'}"
      const values = ['value1', "{'c': 'nested2', 'd': 'nested1'}"];
      const signStr = mockSecret + values.join('');
      const expected = crypto
        .createHash('sha256')
        .update(signStr)
        .digest('hex');

      const result = service.getApiSign(payload);
      expect(result).toBe(expected);
    });

    it('should handle arrays', () => {
      const payload = { a: 'value1', b: [1, 2, 3] };
      const values = ['value1', '1,2,3']; // Arrays are converted to strings
      const signStr = mockSecret + values.join('');
      const expected = crypto
        .createHash('sha256')
        .update(signStr)
        .digest('hex');

      const result = service.getApiSign(payload);
      expect(result).toBe(expected);
    });

    it('should handle empty objects', () => {
      const payload = {};
      const values: string[] = [];
      const signStr = mockSecret + values.join('');
      const expected = crypto
        .createHash('sha256')
        .update(signStr)
        .digest('hex');

      const result = service.getApiSign(payload);
      expect(result).toBe(expected);
    });

    it('should handle null and undefined values', () => {
      const payload = { a: null, b: undefined, c: 'value' };
      // null becomes 'null', undefined becomes 'undefined'
      const values = ['null', 'undefined', 'value'];
      const signStr = mockSecret + values.join('');
      const expected = crypto
        .createHash('sha256')
        .update(signStr)
        .digest('hex');

      const result = service.getApiSign(payload);
      expect(result).toBe(expected);
    });
  });

  describe('verifySign', () => {
    it('should verify valid signature', () => {
      const payload = { a: 'value1', b: 'value2' };
      const sign = service.getApiSign(payload);

      const result = service.verifySign({ ...payload, sign });
      expect(result).toBe(true);
    });

    it('should reject invalid signature', () => {
      const payload = { a: 'value1', b: 'value2' };
      const sign = 'invalid-signature';

      const result = service.verifySign({ ...payload, sign });
      expect(result).toBe(false);
    });

    it('should reject if payload is modified', () => {
      const payload = { a: 'value1', b: 'value2' };
      const sign = service.getApiSign(payload);

      const modifiedPayload = { a: 'value1', b: 'modified', sign };
      const result = service.verifySign(modifiedPayload);
      expect(result).toBe(false);
    });

    it('should handle complex payloads with nested objects', () => {
      const payload = {
        a: 'value1',
        b: { d: 'nested1', c: 'nested2' },
        timestamp: 1629384756,
      };
      const sign = service.getApiSign(payload);

      const result = service.verifySign({ ...payload, sign });
      expect(result).toBe(true);
    });
  });
});
