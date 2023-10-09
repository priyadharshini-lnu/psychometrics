import { render, screen } from '@testing-library/react'

import {
  SpeechToTextInput,
  Props,
} from '~/modules/survey/components/modules/TextEntry/components/SpeechToTextInput/SpeechToTextInput'

test('Should render a button for start dictation', () => {
  const props: Props = {
    value: '',
    onValueChange: jest.fn(),
    isDisabled: false,
    fetchPresignUrl: jest.fn(),
    children: <div />,
  }

  render(<SpeechToTextInput {...props} />)

  const startDictationButton = screen.getByRole('button', {
    name: /Start Dictation/i,
  })

  expect(startDictationButton).toBeInTheDocument()
  expect(startDictationButton).toBeEnabled()
})

test('Should disable the start dictation button when its passed to be disabled', () => {
  const props: Props = {
    value: '',
    onValueChange: jest.fn(),
    isDisabled: true,
    fetchPresignUrl: jest.fn(),
    children: <div />,
  }

  render(<SpeechToTextInput {...props} />)

  const startDictationButton = screen.getByRole('button', {
    name: /Start Dictation/i,
  })

  expect(startDictationButton).toBeDisabled()
})

test('Should disable the start dictation button when speech is not supported in the browser', () => {
  // Make browser incompatible to speech API
  const navigatorSpy = jest.spyOn(window, 'navigator', 'get').mockImplementation(() => undefined as any)

  const props: Props = {
    value: '',
    onValueChange: jest.fn(),
    isDisabled: false,
    fetchPresignUrl: jest.fn(),
    children: <div />,
  }

  render(<SpeechToTextInput {...props} />)

  const startDictationButton = screen.getByRole('button', {
    name: /Start Dictation/i,
  })

  expect(startDictationButton).toBeDisabled()

  // Restore navigation window object
  navigatorSpy.mockRestore()
})
