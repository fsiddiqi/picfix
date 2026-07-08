import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';

if (typeof ImageData === 'undefined') {
  class MockImageData {
    data: Uint8ClampedArray;
    width: number;
    height: number;
    constructor(data: Uint8ClampedArray, width: number, height: number) {
      this.data = data;
      this.width = width;
      this.height = height;
    }
  }
  (globalThis as Record<string, unknown>).ImageData = MockImageData;
}
