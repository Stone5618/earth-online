import { describe, it, expect } from 'vitest';
import { clamp, limitChange } from './gameEngine';

describe('Game Engine Utilities', () => {
  describe('clamp function', () => {
    it('should return the value if within range', () => {
      expect(clamp(50, 0, 100)).toBe(50);
    });
    
    it('should return min if value is below min', () => {
      expect(clamp(-10, 0, 100)).toBe(0);
    });
    
    it('should return max if value is above max', () => {
      expect(clamp(150, 0, 100)).toBe(100);
    });
    
    it('should handle negative ranges', () => {
      expect(clamp(-50, -100, 0)).toBe(-50);
    });
    
    it('should handle edge cases', () => {
      expect(clamp(0, 0, 0)).toBe(0);
      expect(clamp(1, 0, 0)).toBe(0);
      expect(clamp(-1, 0, 0)).toBe(0);
    });
  });
  
  describe('limitChange function', () => {
    describe('non-money values', () => {
      it('should limit positive changes to 30', () => {
        expect(limitChange(50)).toBe(30);
        expect(limitChange(30)).toBe(30);
        expect(limitChange(20)).toBe(20);
      });
      
      it('should limit negative changes to -30', () => {
        expect(limitChange(-50)).toBe(-30);
        expect(limitChange(-30)).toBe(-30);
        expect(limitChange(-20)).toBe(-20);
      });
    });
    
    describe('money values', () => {
      it('should limit positive money changes to 1,000,000', () => {
        expect(limitChange(2000000, true)).toBe(1000000);
        expect(limitChange(1000000, true)).toBe(1000000);
        expect(limitChange(500000, true)).toBe(500000);
      });
      
      it('should limit negative money changes to -1,000,000', () => {
        expect(limitChange(-2000000, true)).toBe(-1000000);
        expect(limitChange(-1000000, true)).toBe(-1000000);
        expect(limitChange(-500000, true)).toBe(-500000);
      });
    });
    
    it('should return zero unchanged', () => {
      expect(limitChange(0)).toBe(0);
      expect(limitChange(0, true)).toBe(0);
    });
  });
});
