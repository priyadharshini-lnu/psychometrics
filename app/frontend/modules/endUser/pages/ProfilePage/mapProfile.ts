import {
  asBoolean, asNumber, asRecord, asString, asStringOrNumber,
} from '~/utils/narrow'

/** The fields the profile page reads off the current user (parity with the legacy Profile page). */
export type ProfileUser = {
  firstName?: string
  lastName?: string
  fullName?: string
  email?: string
  age?: number | string
  gender?: string
  locale?: string
  photo?: string
  timezone?: string
  customFields?: Record<string, unknown>
  updateProfileRequired?: boolean
  updateProfileMessage?: string
  profileCompletionPercentage?: number
}

/** Derive the view model field by field — the `currentUser` slice is legacy untyped JS. */
export const toProfileUser = (raw: Record<string, unknown> | null | undefined): ProfileUser => ({
  firstName: asString(raw?.firstName),
  lastName: asString(raw?.lastName),
  fullName: asString(raw?.fullName),
  email: asString(raw?.email),
  age: asStringOrNumber(raw?.age),
  gender: asString(raw?.gender),
  locale: asString(raw?.locale),
  photo: asString(raw?.photo),
  timezone: asString(raw?.timezone),
  customFields: asRecord(raw?.customFields),
  updateProfileRequired: asBoolean(raw?.updateProfileRequired),
  updateProfileMessage: asString(raw?.updateProfileMessage),
  profileCompletionPercentage: asNumber(raw?.profileCompletionPercentage),
})
