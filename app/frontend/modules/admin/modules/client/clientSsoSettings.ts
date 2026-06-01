import * as t from 'io-ts'

export const ClientSsoSettingsTR = t.type({
  id: t.string,
  ssoEnabled: t.boolean,
  ssoEnforced: t.boolean,
  idpEntityId: t.union([t.string, t.null]),
  idpSsoUrl: t.union([t.string, t.null]),
  idpSloUrl: t.union([t.string, t.null]),
  idpCert: t.union([t.string, t.null]),
  sessionTimeout: t.union([t.number, t.null]),
  allowedDomains: t.array(t.string),
  assertionConsumerServiceUrl: t.string,
  issuer: t.string,
})

export type ClientSsoSettings = t.TypeOf<typeof ClientSsoSettingsTR>
