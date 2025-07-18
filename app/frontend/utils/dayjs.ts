import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import weekday from 'dayjs/plugin/weekday'
import localeData from 'dayjs/plugin/localeData'
import relativeTime from 'dayjs/plugin/relativeTime'
import duration from 'dayjs/plugin/duration'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import isBetween from 'dayjs/plugin/isBetween'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import 'dayjs/locale/ar'
import 'dayjs/locale/bg'
import 'dayjs/locale/cs'
import 'dayjs/locale/de'
import 'dayjs/locale/es'
import 'dayjs/locale/fr'
import 'dayjs/locale/hr'
import 'dayjs/locale/hu'
import 'dayjs/locale/id'
import 'dayjs/locale/it'
import 'dayjs/locale/ja'
import 'dayjs/locale/ko'
import 'dayjs/locale/nl'
import 'dayjs/locale/pl'
import 'dayjs/locale/pt'
import 'dayjs/locale/ro'
import 'dayjs/locale/sk'
import 'dayjs/locale/sl'
import 'dayjs/locale/sr'
import 'dayjs/locale/sr-cyrl'
import 'dayjs/locale/th'
import 'dayjs/locale/vi'
import 'dayjs/locale/zh'
import 'dayjs/locale/zh-tw'

export const localeMapping: Record<string, string> = {
  'zh-Hant': 'zh-tw',
  'es-ES': 'es',
  'sr-Latn': 'sl',
  'sr-Cyrl': 'sr-cyrl',
}

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)
dayjs.extend(weekday)
dayjs.extend(localeData)
dayjs.extend(relativeTime)
dayjs.extend(duration)
dayjs.extend(localizedFormat)
dayjs.extend(isBetween)
dayjs.extend(customParseFormat)

const locale = window.I18n.locale || 'en'
dayjs.locale(localeMapping[locale] || locale)

export default dayjs
