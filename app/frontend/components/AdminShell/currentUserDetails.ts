export type PreferenceRow = {
  category: string
  config_key: string
  payload: Record<string, unknown>
}

export type SignInNoticeKind = 'last_sign_in' | 'last_unsuccessful'

/** Set only on the first details fetch after a sign-in; the server clears it on read. */
export type SignInNotice = {
  kind: SignInNoticeKind
  at: string
}

export type CurrentUserDetails = {
  id: string
  name: string
  email: string
  firstName: string
  lastName: string
  roleTitle: string
  photo?: string
  preferences: PreferenceRow[]
  signInNotice: SignInNotice | null
}

type RawSignInNotice = {
  kind?: string
  at?: string
}

type RawDetails = {
  data?: {
    id: string
    attributes?: {
      name?: string
      email?: string
      first_name?: string
      last_name?: string
      role_title?: string
      photo?: string | null
      preferences?: PreferenceRow[]
      sign_in_notice?: RawSignInNotice | null
    }
  } | null
}

const KINDS: SignInNoticeKind[] = ['last_sign_in', 'last_unsuccessful']

const toSignInNotice = (raw: RawSignInNotice | null | undefined): SignInNotice | null => {
  const kind = KINDS.find(candidate => candidate === raw?.kind)
  if (kind == null || raw?.at == null) return null
  return { kind, at: raw.at }
}

const csrfToken = (): string => document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''

let inflight: Promise<CurrentUserDetails | null> | null = null

// One GET per page load shared by every consumer; current_user_details is the source of truth.
export const fetchCurrentUserDetails = (): Promise<CurrentUserDetails | null> => {
  inflight = inflight ?? fetch('/api/v2/administration/users/current_user_details', {
    headers: { 'X-CSRF-Token': csrfToken() },
  })
    .then(res => (res.ok ? res.json() : { data: null }))
    .then((body: RawDetails) => {
      const { data } = body
      if (data == null) return null
      const attributes = data.attributes ?? {}
      return {
        id: data.id,
        name: attributes.name ?? '',
        email: attributes.email ?? '',
        firstName: attributes.first_name ?? '',
        lastName: attributes.last_name ?? '',
        roleTitle: attributes.role_title ?? '',
        photo: attributes.photo ?? undefined,
        preferences: attributes.preferences ?? [],
        signInNotice: toSignInNotice(attributes.sign_in_notice),
      }
    })
    .catch(() => null)
  return inflight
}

export const findPreference = (
  rows: PreferenceRow[], category: string, configKey: string,
): Record<string, unknown> | null => (
  rows.find(row => row.category === category && row.config_key === configKey)?.payload ?? null
)
