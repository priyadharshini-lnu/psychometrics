import { UnionToIntersection, ConditionalPick, Merge } from 'type-fest'

export type ResolveDefinitions<
V extends { [key: string]: unknown }, D extends Record<string, (value: unknown) => unknown>
> =
  V extends { [key: string]: unknown }
  ? {
    [C in Extract<keyof V, keyof D>]: ReturnType<D[C]>
  }[Extract<keyof V, keyof D>]
  : never;

export type ResolveAttributes<
  V extends Record<string, unknown>, D extends Record<string, (value: unknown) => unknown>
> =
  V extends { [key: string]: unknown }
  ? {
    [C in Exclude<keyof V, keyof D>]: V[C]
  } : never;

export type Resolve<
  V extends { [key: string]: unknown }, D extends Record<string, (value: unknown) => unknown>
> = UnionToIntersection<ResolveDefinitions<V, D> | ResolveAttributes<V, D>>

type Resource = { id: string } | undefined

type HasOneAttribute<Type> = Type extends Record<string, unknown> ? {
  [Property in keyof Type as `${string & Property}Id`]: string
} : never

type HasManyAttribute<Type> = Type extends Record<string, unknown> ? {
  [Property in keyof Type as `${string & Property}Ids`]: string[]
} : never

export type ResolveHasOne<D> = HasOneAttribute<ConditionalPick<D, Resource>>
export type ResolveHasMany<D> = HasManyAttribute<ConditionalPick<D, Resource[]>>
export type ResolveRelationships<D> =Merge<ResolveHasOne<D>, ResolveHasMany<D>>
export type ResolveAttribute<D, E = ResolveRelationships<D>> = {
  [Property in Exclude<keyof D, keyof E>]: D[Property]
}
export type AdditionRelationshipAttribute<D> = Merge<D, ResolveRelationships<D>>

export interface ResourceSchema {
  type: string
  fields: {
    [key: string]: unknown
  }
  relationships?: RelationshipSchema
}

export interface RelationshipSchemaValue {
  type: string
  field?: string
  association?: string
  singularName?: string
  readOnly?: boolean
  getType?: (data: unknown) => string
}
export interface RelationshipSchema {
  [key: string]: RelationshipSchemaValue
}
