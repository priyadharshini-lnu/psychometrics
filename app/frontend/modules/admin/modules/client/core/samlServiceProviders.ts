import * as t from 'io-ts'

export const SamlServiceProviderTR = t.type({
  id: t.string,
  name: t.string,
  entityId: t.string,
  acsUrls: t.array(t.string),
  idpCertificate: t.string,
  ssoServiceUrl: t.string,
  issuerUri: t.string,
  projectId: t.number,
  enabled: t.boolean,
  maskIdentity: t.boolean,
  createdAt: t.string,
  updatedAt: t.string,
})

export type SamlServiceProvider = t.TypeOf<typeof SamlServiceProviderTR>
