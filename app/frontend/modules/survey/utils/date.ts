import { PickerMode } from 'rc-picker/lib/interface'
import { DateFormat } from 'modules/survey/interfaces/questions/TextEntry'

export const getCorrectPickerFromDateFormat = (
  dateFormat: string,
): PickerMode => {
  if (
    dateFormat === DateFormat['MM-YYYY']
    || dateFormat === DateFormat['YYYY-MM']
  ) {
    return 'month'
  }

  if (dateFormat === DateFormat.YYYY) {
    return 'year'
  }

  return 'date'
}
