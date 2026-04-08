import _ from 'lodash'

const Form = ({ choices, choicesTexts, formTypes = [] }, result: object): object => {
  // eslint-disable-next-line arrow-body-style
  const extendedResult = _.times(choices, Number).reduce((res: object, i: number) => {
    return { ...res, [`choicesTexts${i + 1}`]: choicesTexts[i] }
  }, result)

  return formTypes.reduce((res: object, { optionList }, i: number) => {
    if (!optionList) return res
    return extendByOptionsLocales(optionList, i, res)
  }, extendedResult)
}

const extendByOptionsLocales = (
  optionList: string[] | { [key: string]: string },
  typeIndex: number,
  result: object,
): object => {
  if (Array.isArray(optionList)) {
  // eslint-disable-next-line arrow-body-style
    return optionList.reduce((res: object, option: string, i: number) => {
      return { ...res, [`formOptionText${typeIndex}_${i}`]: option }
    }, result)
  }
  const entries = Object.entries(optionList || {})
  // eslint-disable-next-line arrow-body-style
  return entries.reduce((res: object, [, value], i: number) => {
    return { ...res, [`formOptionText${typeIndex}_${i}`]: value }
  }, result)
}

export default Form
