export type OfficeRenderer = 'webgl' | 'canvas';
export type RendererPreference = OfficeRenderer | 'auto';

// Test actual framebuffer readback, not just the existence of a WebGL interface.
// Some old drivers return a context but cannot render into its attachments.
export const detectOfficeRenderer = (
  createCanvas: () => HTMLCanvasElement = () => document.createElement('canvas'),
): OfficeRenderer => {
  let gl: WebGLRenderingContext | null = null;
  let texture: WebGLTexture | null = null;
  let framebuffer: WebGLFramebuffer | null = null;
  try {
    const canvas = createCanvas();
    canvas.width = canvas.height = 2;
    gl = canvas.getContext('webgl', {
      antialias: false,
      alpha: false,
      failIfMajorPerformanceCaveat: true,
    });
    if (!gl || gl.isContextLost()) return 'canvas';
    texture = gl.createTexture();
    framebuffer = gl.createFramebuffer();
    if (!texture || !framebuffer) return 'canvas';
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) return 'canvas';
    gl.viewport(0, 0, 2, 2);
    gl.clearColor(0.25, 0.5, 0.75, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    const pixel = new Uint8Array(4);
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
    return gl.getError() === gl.NO_ERROR &&
      [64, 128, 191, 255].every((value, index) => Math.abs(pixel[index]! - value) <= 2)
      ? 'webgl'
      : 'canvas';
  } catch {
    return 'canvas';
  } finally {
    if (gl) {
      try {
        gl.deleteFramebuffer(framebuffer);
        gl.deleteTexture(texture);
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      } catch {
        /* Cleanup must not prevent Canvas fallback on a broken driver. */
      }
    }
  }
};
