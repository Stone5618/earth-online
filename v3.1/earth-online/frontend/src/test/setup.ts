import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Real localStorage mock that stores data
const localStorageData: { [key: string]: string } = {};

const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageData[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageData[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageData[key];
  }),
  clear: vi.fn(() => {
    Object.keys(localStorageData).forEach(key => delete localStorageData[key]);
  }),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock howler
vi.mock('howler', () => ({
  Howl: vi.fn().mockImplementation(() => ({
    play: vi.fn(),
    pause: vi.fn(),
    stop: vi.fn(),
  })),
}));

// Mock global fetch
global.fetch = vi.fn();
