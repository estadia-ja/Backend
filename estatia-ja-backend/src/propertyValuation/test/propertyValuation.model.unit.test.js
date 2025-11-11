import { describe, it, expect } from 'vitest';
import PropertyValuation from '../model.js';

describe('teste model property valuation', () => {
  const mockData = {
    id: 'prop-123',
    noteProperty: 4.5,
    commentProperty: 'Ótima localização',
    reserveId: 'reserve-abc',
  };

  it('should correctly instantiate and assign properties from data', () => {
    const valuation = new PropertyValuation(mockData);

    expect(valuation).toBeInstanceOf(PropertyValuation);
    expect(valuation.id).toBe('prop-123');
    expect(valuation.noteProperty).toBe(4.5);
    expect(valuation.commentProperty).toBe('Ótima localização');
    expect(valuation.reserveId).toBe('reserve-abc');
  });

  it('should return the correct object from toJson()', () => {
    const valuation = new PropertyValuation(mockData);

    const jsonOutput = valuation.toJson();

    expect(jsonOutput).toEqual(mockData);
    expect(jsonOutput).toBe(valuation);
  });

  it('should handle partial or different data', () => {
    const partialData = {
      id: 'prop-456',
      noteProperty: 3,
    };

    const valuation = new PropertyValuation(partialData);

    expect(valuation.id).toBe('prop-456');
    expect(valuation.noteProperty).toBe(3);
    expect(valuation.commentProperty).toBeUndefined();
    expect(valuation.reserveId).toBeUndefined();
  });
});
