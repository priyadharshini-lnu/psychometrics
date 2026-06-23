/**
 * Maps application locale codes to OCI Speech Realtime API language codes (BCP-47 format).
 *
 * Currently supports only English and Arabic.
 * All other locales fall back to English (en-US).
 *
 * OCI Realtime Speech API requires BCP-47 language codes (e.g., 'en-US', 'ar-SA').
 * Note: Simple 2-letter codes like 'en' don't work with OCI Realtime API.
 * BCP-47 format is mandatory.
 */

const APP_TO_OCI_REALTIME_LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  'en-US': 'en-US',

  ar: 'ar-SA',
}

export const resolveOciRealtimeLocale = (locale: string, fallback = 'en-US'): string => {
  if (!locale) return fallback

  const languageCode = APP_TO_OCI_REALTIME_LOCALE_MAP[locale]

  if (!languageCode) {
    // Log warning for unmapped locales (helpful for debugging)
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `[OciRealtimeSpeech] Locale '${locale}' not mapped to OCI language code. Falling back to '${fallback}'.`,
      )
    }
    return fallback
  }

  return languageCode
}
