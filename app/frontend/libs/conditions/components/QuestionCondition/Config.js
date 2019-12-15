const AdditionalConditions = {
  SelectedCount: { value: 'SelectedCount', label: 'Selected Count', type: 'input' },
  TextField: { value: 'TextField', label: 'Text Field', type: 'input' },
  Dislike: { value: 'Dislike', label: 'Dislike', type: 'bool' },
  DislikeCount: { value: 'DislikeCount', label: 'Dislike (Count)', type: 'input' },
  Neutral: { value: 'Neutral', label: 'Neutral', type: 'bool' },
  NeutralCount: { value: 'NeutralCount', label: 'Neutral (Count)', type: 'input' },
  Like: { value: 'Like', label: 'Like', type: 'bool' },
  LikeCount: { value: 'LikeCount', label: 'Like (Count)', type: 'input' },
  On: { value: 'On', label: 'On', type: 'bool' },
  OnCount: { value: 'OnCount', label: 'On (Count)', type: 'input' },
  Off: { value: 'Off', label: 'Off', type: 'bool' },
  OffCount: { value: 'OffCount', label: 'Off (Count)', type: 'input' },
}

const Config = {
  StaticContent: {
    conditions: {},
  },

  MultipleChoice: {
    defaultChoiceText: i => `Click to write Choice ${i}`,
    conditions: {
      SingleAnswer: {
        collection: 'choicesTexts', type: 'bool',
      },
      MultipleAnswer: {
        collection: 'choicesTexts',
        type: 'bool',
        additional: [AdditionalConditions.SelectedCount],
      },
      Dropdown: {
        collection: 'choicesTexts', type: 'bool',
      },
      SelectBox: {
        collection: 'choicesTexts', type: 'bool',
      },
      MultiSelectBox: {
        collection: 'choicesTexts',
        type: 'bool',
        additional: [AdditionalConditions.SelectedCount],
      },
    },
  },

  TextEntry: {
    defaultChoiceText: i => `Click to write Form field ${i}`,
    conditions: {
      SingleLine: {
        additional: [AdditionalConditions.TextField],
      },
      MultiLine: {
        additional: [AdditionalConditions.TextField],
      },
      EssayTextBox: {
        additional: [AdditionalConditions.TextField],
      },
      Password: {
        additional: [AdditionalConditions.TextField],
      },
      Form: {
        collection: 'choicesTexts', type: 'input',
      },
    },
  },

  MatrixTable: {
    defaultChoiceText: i => `Click to write Choice ${i}`,
    defaultScalePointText: i => `Click to write Scale point ${i}`,
    defaultLabelText: i => `Click to write Label ${i}`,
    conditions: {},
  },

  Slider: {
    defaultChoiceText: i => `Click to write Choice ${i}`,
    defaultLabelText: i => `Click to write Label ${i}`,
    conditions: {
      Slider: {
        collection: 'choicesTexts', type: 'input',
      },
      Bar: {
        collection: 'choicesTexts', type: 'input',
      },
      Star: {
        collection: 'choicesTexts', type: 'input',
      },
    },
  },

  MetaInfo: {
    conditions: {},
  },

  RankOrder: {
    defaultChoiceText: i => `Click to write Item ${i}`,
    conditions: {
      DragAndDrop: {
        collection: 'choicesTexts', type: 'input',
      },
      RadioButtons: {
        collection: 'choicesTexts', type: 'input',
      },
      TextBox: {
        collection: 'choicesTexts', type: 'input',
      },
      SelectBox: {
        collection: 'choicesTexts', type: 'input',
      },
    },
  },

  SideBySide: {
    defaultStatementText: i => `Click to write Statement ${i}`,
    defaultGroupText: i => `Click to write Group ${i}`,
    defaultAnswerText: i => `Answer ${i}`,
    conditions: {},
  },

  GapAnalysis: {
    defaultCategoryText: i => `Click to write Category ${i}`,
    defaultAnswerText: () => 'Why',
    conditions: {},
  },

  ConstantSum: {
    defaultChoiceText: i => `Click to write Choice ${i}`,
    defaultLabelText: i => `Click to write Label ${i}`,
    conditions: {
      Choice: {
        collection: 'choicesTexts', type: 'input',
      },
      Bar: {
        collection: 'choicesTexts', type: 'input',
      },
      Slider: {
        collection: 'choicesTexts', type: 'input',
      },
    },
  },

  PickGroupRank: {
    defaultChoiceText: i => `Click to write Item ${i}`,
    defaultScalePointText: i => `Click to write Group ${i}`,
    conditions: {},
  },

  Timing: {
    conditions: {},
  },

  Captcha: {
    conditions: {},
  },

  HotSpot: {
    conditions: {
      additional: {
        Switcher: [
          AdditionalConditions.On, AdditionalConditions.OnCount,
          AdditionalConditions.Off, AdditionalConditions.OffCount,
        ],
        Liker: [
          AdditionalConditions.Dislike, AdditionalConditions.DislikeCount,
          AdditionalConditions.Neutral, AdditionalConditions.NeutralCount,
          AdditionalConditions.Like, AdditionalConditions.LikeCount,
        ],
      },
    },
  },

  GraphicSlider: {
    conditions: {},
  },

}

export default Config
