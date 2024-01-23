import { describe, it, expect, expectTypeOf } from 'vitest';
import * as A from '@data/array';
import * as O from '@data/option';
import { pipe } from '../pipe';

describe('Array', () => {
  it('should traverse with option some', () => {
    const result = pipe(
      [1, 2, 3],
      A.traverse(O.Applicative)(a => (a > 0 ? O.some(a) : O.none())),
    );
    expectTypeOf(result).toEqualTypeOf<O.Option<number[]>>();
    expect(result).toEqual(O.some([1, 2, 3]));
  });
  it('should traverse with option none', () => {
    const result = pipe(
      [1, 2, 3],
      A.traverse(O.Applicative)(a => (a > 1 ? O.some(a) : O.none())),
    );
    expectTypeOf(result).toEqualTypeOf<O.Option<number[]>>();
    expect(result).toEqual(O.none());
  });
});
