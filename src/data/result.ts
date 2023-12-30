import { Kind } from "@kinds";
import { InvariantParam, CovariantParam } from "../kinds/variance";
import * as tfunctor from "@typeclass/functor";
import * as tbifunctor from "@typeclass/bifunctor";
import * as tOf from "@typeclass/of";

export interface Err<E> {
  readonly _tag: "Err";
  readonly err: E;
}

export interface Ok<A> {
  readonly _tag: "Ok";
  readonly ok: A;
}

export type Result<A, E> = Ok<A> | Err<E>;

export const err = <E>(e: E): Result<never, E> => ({ _tag: "Err", err: e });
export const ok = <A>(a: A): Result<A, never> => ({ _tag: "Ok", ok: a });

export const isErr = <E>(result: Result<unknown, E>): result is Err<E> =>
  result._tag === "Err";

export const isOk = <A>(result: Result<A, unknown>): result is Ok<A> =>
  result._tag === "Ok";

export interface TResult extends Kind<[InvariantParam, CovariantParam]> {
  return: Result<this["arg0"], this["arg1"]>;
}

export const Of: tOf.Of<TResult> = {
  of: ok,
};

export const Bifunctor: tbifunctor.BiFunctor<TResult> = {
  bimap: (f, g) => (fa) => (isOk(fa) ? ok(f(fa.ok)) : err(g(fa.err))),
};

export const Functor: tfunctor.Functor<TResult> = {
  map: tbifunctor.mapLeft(Bifunctor),
};

/**
 * of :: a -> Result<a, e>
 * @param a : a
 * @returns fa: Result<a, e>
 *
 * @example
 * ```ts
 * pipe(1, of) // ok(1)
 * ```
 */
export const of = Of.of;

/**
 * map :: (a -> b) -> Result<a, e> -> Result<b, e>
 * @param f : a -> b
 * @returns fa: Result<a, e> -> Result<b, e>
 *
 * @example
 * ```ts
 * pipe(ok(0), map(x => x + 1)) // ok(1)
 * pipe(err("error"), map(x => x + 1)) // err("error")
 * ```
 */
export const map = Functor.map;

/**
 * flap :: a -> Result<(a -> b), e> -> Result<b, e>
 * @param a : a
 * @returns fab: Result<(a -> b), e> -> Result<b, e>
 *
 * @example
 * ```ts
 * pipe(ok(x => x + 1), flap(0)) // ok(1)
 * pipe(err("error"), flap(0)) // err("error")
 * ```
 */
export const flap = tfunctor.flap(Functor);

/**
 * doubleMap :: (a -> b) -> Result<Result<a, e1>, e2> -> Result<Result<b, e1>, e2>
 * @param f : a -> b
 * @returns fa: Result<Result<a, e1>, e2> -> Result<Result<b, e1>, e2>
 *
 * @example
 * ```ts
 * pipe(ok(ok(0)), doubleMap(x => x + 1)) // ok(ok(1))
 * pipe(err("error"), doubleMap(x => x + 1)) // err("error")
 * ```
 */
export const doubleMap = tfunctor.mapComposition(Functor, Functor);

/**
 * bimap :: (a -> b) -> (e1 -> e2) -> Result<a, e1> -> Result<b, e2>
 * @param f : a -> b
 * @param g : e1 -> e2
 * @returns fa: Result<a, e1> -> Result<b, e2>
 *
 * @example
 * ```ts
 * pipe(ok(0), bimap(x => x + 1, x => x + "!")) // ok(1)
 * pipe(err("error"), bimap(x => x + 1, x => x + "!")) // err("error!")
 * ```
 */
export const bimap = Bifunctor.bimap;

/**
 * mapErr :: (e1 -> e2) -> Result<a, e1> -> Result<a, e2>
 * @param f : e1 -> e2
 * @returns fa: Result<a, e1> -> Result<a, e2>
 *
 * @example
 * ```ts
 * pipe(ok(0), mapErr(x => x + "!")) // ok(0)
 * pipe(err("error"), mapErr(x => x + "!")) // err("error!")
 */
export const mapErr = tbifunctor.mapRight(Bifunctor);
