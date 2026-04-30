import { describe, it, expect } from 'vitest';
import { formatStatName, parseTraitEffect } from './statUtils';

describe('Stat Utilities', () => {
  describe('formatStatName function', () => {
    it('should format known stats to Chinese', () => {
      expect(formatStatName('intelligence')).toBe('智力');
      expect(formatStatName('creativity')).toBe('创造力');
      expect(formatStatName('luck')).toBe('运气');
      expect(formatStatName('charm')).toBe('魅力');
      expect(formatStatName('health')).toBe('健康');
      expect(formatStatName('energy')).toBe('精力');
      expect(formatStatName('money')).toBe('金钱');
      expect(formatStatName('mood')).toBe('心情');
      expect(formatStatName('karma')).toBe('福报');
    });
    
    it('should return unknown stats as-is', () => {
      expect(formatStatName('unknown_stat')).toBe('unknown_stat');
      expect(formatStatName('')).toBe('');
    });
  });
  
  describe('parseTraitEffect function', () => {
    it('should parse positive stat changes from trait effect', () => {
      const testTrait = {
        effect: (stats: any) => ({
          ...stats,
          intelligence: 10,
          creativity: -5,
        }),
      };
      
      const result = parseTraitEffect(testTrait);
      
      expect(result).toEqual({
        intelligence: 10,
        creativity: -5,
      });
    });
    
    it('should ignore unchanged stats', () => {
      const testTrait = {
        effect: (stats: any) => ({
          ...stats,
          intelligence: 0, // same as base
          creativity: 0, // same as base
        }),
      };
      
      const result = parseTraitEffect(testTrait);
      
      expect(result).toEqual({});
    });
    
    it('should handle all stat changes', () => {
      const testTrait = {
        effect: (stats: any) => ({
          ...stats,
          health: 20,
          maxHealth: 50,
          energy: -10,
          money: 1000,
        }),
      };
      
      const result = parseTraitEffect(testTrait);
      
      expect(result).toEqual({
        health: 20,
        maxHealth: 50,
        energy: -10,
        money: 1000,
      });
    });
  });
});
