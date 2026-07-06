import * as t from 'io-ts'

export const PublicKeyTR = t.type({
  id: t.string,
  keyId: t.string,
  issuer: t.union([t.string, t.null]),
  audience: t.union([t.string, t.null]),
  publicKey: t.union([t.string, t.null]),
  fingerprint: t.union([t.string, t.null]),
  description: t.union([t.string, t.null]),
  disabled: t.boolean,
  createdAt: t.union([t.string, t.null]),
  updatedAt: t.union([t.string, t.null]),
  createdBy: t.union([t.string, t.null]),
})

export type PublicKey = t.TypeOf<typeof PublicKeyTR>

export const GenerateKeyPairResponseTR = t.type({
  privateKey: t.string,
})

export const Schema = {
  type: 'public_keys',
}
