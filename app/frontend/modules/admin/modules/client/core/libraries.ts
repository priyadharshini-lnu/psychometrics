import * as t from 'io-ts'
import { ResourceIdentifierTR } from '~/modules/admin/core/types/resource'

export const MediaLibraryTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    name: t.string,
    description: t.union([t.string, t.undefined, t.null]),
    type: t.string,
    fileIsImage: t.boolean,
    fileIconUrl: t.union([t.string, t.undefined, t.null]),
    fileUrl: t.union([t.string, t.undefined, t.null]),
    owner: t.union([
      t.type({
        id: t.string,
        name: t.string,
      }),
      t.undefined,
    ]),
  })])

export type MediaLibrary = t.TypeOf<typeof MediaLibraryTR>
