import * as t from 'io-ts'
import { ResourceIdentifierTR } from '~/modules/admin/core/types/resource'

export const IdpTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    name: t.string,
    description: t.string,
    selfRatingEnabled: t.boolean,
  })])

export type Idp = t.TypeOf<typeof IdpTR>

export const Schema = {
  type: 'idp_templates',
  relationships: {
    skills: {
      type: 'skills',
    },
  },
}
