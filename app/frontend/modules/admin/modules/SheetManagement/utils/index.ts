import lowerCase from 'lodash/lowerCase'
import capitalize from 'lodash/capitalize'

export const toReadableString = (inputString: string): string => capitalize(lowerCase(inputString))
