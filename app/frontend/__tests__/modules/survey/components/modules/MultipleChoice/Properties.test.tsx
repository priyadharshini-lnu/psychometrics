import { render } from '@testing-library/react'
import { createStore } from 'redux'
import { Provider } from 'react-redux'

import {
  Properties,
  Props,
} from '~/modules/survey/components/modules/MultipleChoice/Properties'

const testStore = (state=[], _) => {
  return state
}

const store = createStore(testStore)

describe('Assessment builder - MultipleChoice - Property panel', () => {
  const basicProps: Props = {
    model: {
      id: 0,
      block_id: 1,
      name: '',
      position: 1,
      type: 'SingleAnswer',
      validation: {
        type: '',
        args: {},
      },
      requiredValidation: {
        enabled: false,
        type: '',
      },
      props: {
        position: 'Vertical',
        notApplicable: false,
        notApplicableLabel: 'N/A',
        withImageChoice: false,
        isImagePreviewEnable: false,
        imageChoiceSize: 'small',
        choices: 2,
        choicesTexts: ['Choice 1', 'Choice 2'],
        choicesImages: [],
        questionText: 'Question test',
        type: 'SingleAnswer',
      },
      setChoices: jest.fn(),
      resetDefaultValues: jest.fn(),
      moduleConfig: {
        moduleName: 'Multiple Choice',
        defaultChoiceText: jest.fn(),
        validations: false,
        randomization: false,
        defaultValue: false,
        scoring: false,
      },
      changeReqValidations: jest.fn(),
      changeProps: jest.fn(),
      update: jest.fn,
      setFormFields: jest.fn(),
      changeArrayProps: jest.fn(),
    },
  }

  test('Should match snapshot with Single Answer type', () => {
    const { asFragment } = render(<Provider store={store}><Properties {...basicProps} /></Provider>)
    expect(asFragment()).toMatchSnapshot()
  })
})
