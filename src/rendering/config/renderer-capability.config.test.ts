import { describe, expect, it, vi } from 'vitest';
import { detectOfficeRenderer } from './renderer-capability.config';

const makeDriver = () => ({
  TEXTURE_2D: 3553,
  TEXTURE_MIN_FILTER: 10241,
  TEXTURE_MAG_FILTER: 10240,
  NEAREST: 9728,
  RGBA: 6408,
  UNSIGNED_BYTE: 5121,
  FRAMEBUFFER: 36160,
  COLOR_ATTACHMENT0: 36064,
  FRAMEBUFFER_COMPLETE: 36053,
  COLOR_BUFFER_BIT: 16384,
  NO_ERROR: 0,
  isContextLost: () => false,
  createTexture: () => ({}),
  createFramebuffer: () => ({}),
  bindTexture: vi.fn(),
  texParameteri: vi.fn(),
  texImage2D: vi.fn(),
  bindFramebuffer: vi.fn(),
  framebufferTexture2D: vi.fn(),
  checkFramebufferStatus: () => 36053,
  viewport: vi.fn(),
  clearColor: vi.fn(),
  clear: vi.fn(),
  readPixels: (
    _x: number,
    _y: number,
    _w: number,
    _h: number,
    _format: number,
    _type: number,
    pixel: Uint8Array,
  ) => pixel.set([64, 128, 191, 255]),
  getError: () => 0,
  deleteFramebuffer: vi.fn(),
  deleteTexture: vi.fn(),
  getExtension: () => ({ loseContext: vi.fn() }),
});
const canvasFor = (driver: ReturnType<typeof makeDriver> | null) => () =>
  ({ getContext: () => driver }) as unknown as HTMLCanvasElement;

describe('renderer capability probe', () => {
  it('uses Canvas when WebGL is unavailable or context creation throws', () => {
    expect(detectOfficeRenderer(canvasFor(null))).toBe('canvas');
    expect(
      detectOfficeRenderer(() => {
        throw new Error('Driver failed');
      }),
    ).toBe('canvas');
  });
  it('accepts a working framebuffer with correct pixel readback and releases probe resources', () => {
    const driver = makeDriver();
    expect(detectOfficeRenderer(canvasFor(driver))).toBe('webgl');
    expect(driver.deleteFramebuffer).toHaveBeenCalledOnce();
    expect(driver.deleteTexture).toHaveBeenCalledOnce();
  });
  it('rejects an incomplete framebuffer even when a WebGL context exists', () => {
    const driver = makeDriver();
    driver.checkFramebufferStatus = () => 36054;
    expect(detectOfficeRenderer(canvasFor(driver))).toBe('canvas');
    expect(driver.deleteTexture).toHaveBeenCalledOnce();
  });
  it('rejects drivers that return incorrect pixels or graphics errors', () => {
    const driver = makeDriver();
    driver.readPixels = (_x, _y, _w, _h, _f, _t, pixel) => pixel.fill(0);
    expect(detectOfficeRenderer(canvasFor(driver))).toBe('canvas');
    const failing = makeDriver();
    failing.getError = () => 1280;
    expect(detectOfficeRenderer(canvasFor(failing))).toBe('canvas');
  });
  it('does not let a broken cleanup call prevent fallback', () => {
    const driver = makeDriver();
    driver.checkFramebufferStatus = () => 36054;
    driver.getExtension = () => {
      throw new Error('Lost driver');
    };
    expect(detectOfficeRenderer(canvasFor(driver))).toBe('canvas');
  });
});
