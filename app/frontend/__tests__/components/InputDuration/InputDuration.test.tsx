import { render, cleanup, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import invert from 'lodash/invert'

import InputDuration, { maskUp, convertToInt } from '~/components/InputDuration'

test('should match snapshot', () => {
  const { asFragment } = render(
    <InputDuration
      className="user-defined-class"
      placeholder="Enter as 4d 3h 2m 1s"
      value=""
      onChange={vi.fn()}
    />,
  )

  expect(asFragment()).toMatchSnapshot()
})

test('masking func should clear out invalid input values', () => {
  const inValidInputValues = [
    '0',
    'd',
    'h',
    'm',
    's',
    '-1',
    '100D',
    '3z 2a',
    '23H',
    '3Z     ',
    'd h m s',
    '3z 2a 1p',
    '3z 2a 1p 0q',
    '0d 0h 0m 0s',
    '2D 1H 1M 1S',
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
    Number.NaN,
  ]

  for (const inValidInputValue of inValidInputValues) {
    expect(maskUp(inValidInputValue)).toEqual('')
  }
})

test("component should'nt allow invalid format initial values", async () => {
  const placeholder = 'inputWithInValidValue'
  const inValidInputValues = ['d h m s', '3z 2a 1p']

  for (const inValidInputValue of inValidInputValues) {
    const { findByPlaceholderText } = render(
      <InputDuration
        placeholder={placeholder}
        value={inValidInputValue}
        onChange={vi.fn()}
      />,
    )
    const inputWithIncorrectValue = await findByPlaceholderText(placeholder)

    expect(inputWithIncorrectValue).toHaveDisplayValue('')
    cleanup()
  }
})

test('masking func should allow valid in-sequence format input values', () => {
  const validInputValues = [
    '1d 2h 3m 4s',
    '1d',
    '2h',
    '3m',
    '4s',
    '1d 2h',
    '1d 2h 3m',
    '1d 3m',
    '1d 3m 4s',
    '1d 4s',
    '2h 3m',
    '2h 3m 4s',
    '2h 4s',
    '3m 4s',
    '',
  ]

  for (const validInputValue of validInputValues) {
    expect(maskUp(validInputValue)).toEqual(validInputValue)
  }
})

test('component should allow valid in-sequence format initial values', async () => {
  const placeholder = 'inputWithValidValue'
  const validInputValues = ['1d 2h 3m 4s', '3m 4s']

  for (const validInputValue of validInputValues) {
    const { findByPlaceholderText } = render(
      <InputDuration
        placeholder={placeholder}
        value={validInputValue}
        onChange={vi.fn()}
      />,
    )
    const inputWithCorrectValue = await findByPlaceholderText(placeholder)

    expect(inputWithCorrectValue).toHaveDisplayValue(validInputValue)
    cleanup()
  }
})

test('masking and convertToInt func should output correct value with valid inputs', () => {
  const validTimesDict = {
    1: '1s',
    59: '59s',
    60: '1m',
    3599: '59m 59s',
    3600: '1h',
    3601: '1h 1s',
    3660: '1h 1m',
    86399: '23h 59m 59s',
    86400: '1d',
    86401: '1d 1s',
    86460: '1d 1m',
    86461: '1d 1m 1s',
    90000: '1d 1h',
    90061: '1d 1h 1m 1s',
  }

  const validTimes = Object.keys(validTimesDict)
  for (const validTime of validTimes) {
    expect(maskUp(validTime)).toEqual(validTimesDict[validTime])
  }

  const invertedValidTimesDict = invert(validTimesDict)
  const validMaskedTimes = Object.keys(invertedValidTimesDict)
  for (const validMaskedTime of validMaskedTimes) {
    expect(convertToInt(validMaskedTime)).toEqual(
      parseInt(invertedValidTimesDict[validMaskedTime]),
    )
  }
})

test('component should format input time in seconds to valid format', async () => {
  const placeholder = 'inputWithValidTimeValue'
  const validTimesValue = {
    30: '30s',
    90061: '1d 1h 1m 1s',
  }

  const validTimes = Object.keys(validTimesValue)

  for (const validTime of validTimes) {
    const { findByPlaceholderText } = render(
      <InputDuration
        placeholder={placeholder}
        value={validTime}
        onChange={vi.fn()}
      />,
    )
    const inputWithCorrectValue = await findByPlaceholderText(placeholder)

    expect(inputWithCorrectValue).toHaveDisplayValue(validTimesValue[validTime])
    cleanup()
  }
})

test('masking func should filter out invalid format given part valid and part invalid input', () => {
  const mixedInputValuesDict = {
    '1d 2': '1d',
    '1d 2X': '1d',
    '1d 2d': '1d',
    '1d 2d 1h': '1d 1h',
    '1d 2d 1m': '1d 1m',
    '1d 2d 1s': '1d 1s',
    '1d 2d 1h 1m': '1d 1h 1m',
    '1d 2d 1h 1s': '1d 1h 1s',
    '1d 2d 1m 1s': '1d 1m 1s',
    '1d 2d 22d 1m 1s': '1d 1m 1s',
    '1h 2': '1h',
    '1h 2X': '1h',
    '1h 2h': '1h',
    '1h 1d': '1d 1h',
    '1h 2h 1d': '1d 1h',
    '1h 2h 1m': '1h 1m',
    '1h 2h 1s': '1h 1s',
    '1h 2h 1m 1s': '1h 1m 1s',
    '1m 2': '1m',
    '1m 2X': '1m',
    '1m 1h': '1h 1m',
    '1m 1h 1d': '1d 1h 1m',
    '1m 2m 1s': '1m 1s',
    '1m 2m 1d': '1d 1m',
    '1m 2m 1h': '1h 1m',
    '1m 2m 1d 1s': '1d 1m 1s',
    '1m 2m 1h 1s': '1h 1m 1s',
    '1m 2m 1d 1h': '1d 1h 1m',
    '1s 1m 1h 1d': '1d 1h 1m 1s',
    '1s 1m 1h': '1h 1m 1s',
    '1s 1m': '1m 1s',
    '1s     1h': '1h 1s',
    '     1s    WW   1m': '1m 1s',
  }

  const mixedInputValues = Object.keys(mixedInputValuesDict)

  for (const mixedInputValue of mixedInputValues) {
    expect(maskUp(mixedInputValue)).toEqual(
      mixedInputValuesDict[mixedInputValue],
    )
  }
})

test('component should filter out invalid format given part valid and part invalid initial values', async () => {
  const placeholder = 'inputWithMixedTimeValue'
  const mixedInputValuesDict = {
    '1s     1h': '1h 1s',
    '     1s    WW   1m': '1m 1s',
    '1s 1d': '1d 1s',
  }

  const mixedInputValues = Object.keys(mixedInputValuesDict)

  for (const mixedInputValue of mixedInputValues) {
    const { findByPlaceholderText } = render(
      <InputDuration
        placeholder={placeholder}
        value={mixedInputValue}
        onChange={vi.fn()}
      />,
    )
    const inputWithCorrectValue = await findByPlaceholderText(placeholder)

    expect(inputWithCorrectValue).toHaveDisplayValue(
      mixedInputValuesDict[mixedInputValue],
    )
    cleanup()
  }
})

test('component should only allow correct values on blur or on enter', async () => {
  const placeholder = 'inputWithBlurFiltering'

  render(
    <InputDuration placeholder={placeholder} value="" onChange={vi.fn()} />,
  )

  const inputElem = screen.getByPlaceholderText(placeholder)

  const inputOutputDict = [
    {
      input: '1h sddgsdgd 43ss  8A 1m 2656 55S    ',
      output: '1h 1m',
    },
    {
      input: '1h 1s',
      output: '1h 1s',
    },
    {
      input: '1s 5h 2d 4m',
      output: '2d 5h 4m 1s',
    },
    {
      input: '   1d 2d 3d 4d 5d',
      output: '1d',
    },
    {
      input: '100000000s',
      output: '1157d 9h 46m 40s',
    },
    {
      input: '1000d 1000h 1000m 1000s',
      output: '1042d 8h 56m 40s',
    },
  ]

  for (const value of inputOutputDict) {
    // Check on blur
    await checkOutputAgainstTypedInputOn('blur', inputElem, value.input, value.output)

    // Check on enter
    await checkOutputAgainstTypedInputOn(
      'enter',
      inputElem,
      value.input,
      value.output,
    )
  }
})

const checkOutputAgainstTypedInputOn = async (
  type: 'blur' | 'enter',
  inputElem: HTMLElement,
  inputValue: string,
  outputValue: string,
) => {
  const user = userEvent.setup()

  // clear any previous values
  await user.clear(inputElem)

  // type in the input duration
  await user.type(inputElem, inputValue)

  // press tab to change focus and activate on blur clean up of value
  if (type === 'blur') {
    await user.tab()
  } else if (type === 'enter') {
    await user.type(inputElem, '{enter}')
  }
  // verify that entered input was formatted correctly
  expect(inputElem).toHaveDisplayValue(outputValue)
}
