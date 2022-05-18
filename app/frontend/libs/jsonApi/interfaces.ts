import { UnionToIntersection } from 'type-fest'

export type ResolveDefinitions<V extends { [key: string]: unknown }, D extends Record<string, (value: string | string[]) => unknown>> =
  V extends { [key: string]: unknown }
  ? {
    [C in Extract<keyof V, keyof D>]: ReturnType<D[C]>
  }[Extract<keyof V, keyof D>]
  : never;

export type ResolveAttributes<V extends Record<string, unknown>, D extends Record<string, (value: string | string[]) => unknown>> =
  V extends { [key: string]: unknown }
  ? {
    [C in Exclude<keyof V, keyof D>]: V[C]
  } : never;

export type Resolve<V extends { [key: string]: unknown }, D extends Record<string, (value: string | string[]) => unknown>> = UnionToIntersection<ResolveDefinitions<V, D> | ResolveAttributes<V, D>>
