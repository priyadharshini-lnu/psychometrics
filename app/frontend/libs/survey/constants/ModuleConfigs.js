const ModuleConfigs = {
  StaticContent: {
    moduleName: 'Text / Graphic',
    icon: 'paragraph',
    randomization: false,
    defaultValue: false,
  },

  MultipleChoice: {
    moduleName: 'Multiple Choice',
    defaultChoiceText: i => `Click to write Choice ${i}`,
    icon: 'check-square-o',
    validations: {
      MultipleAnswer: ['Least', 'Range'],
      MultiSelectBox: ['Least', 'Range'],
    },
    randomization: true,
    defaultValue: true,
    scoring: true,
    scoringFilteredModules: [],
  },

  TextEntry: {
    moduleName: 'Text Entry',
    defaultChoiceText: i => `Click to write Form field ${i}`,
    icon: 'font',
    validations: {
      SingleLine: ['MinLength', 'MaxLength', 'CharacterRange', 'Content'],
      MultiLine: ['MinLength', 'MaxLength', 'CharacterRange'],
      EssayTextBox: ['MinLength', 'MaxLength', 'CharacterRange'],
      Password: ['MinLength', 'MaxLength', 'CharacterRange'],
    },
    randomization: true,
    defaultValue: true,
    scoring: true,
    scoringFilteredModules: ['Form'],
  },

  MatrixTable: {
    moduleName: 'Matrix Table',
    defaultChoiceText: i => `Click to write Choice ${i}`,
    defaultScalePointText: i => `Click to write Scale point ${i}`,
    defaultLabelText: i => `Click to write Label ${i}`,
    icon: 'table',
    validations: {
      RankOrder: ['MustRankAll', 'MustRankBetween'],
      ConstantSum: ['MustTotal'],
      TextEntry: ['MinLength', 'MaxLength', 'CharacterRange', 'ContentValidation'],
    },
    randomization: false,
    defaultValue: true,
    scoring: true,
    scoringFilteredModules: ['ConstantSum', 'MaxDiff', 'Profile', 'RankOrder', 'TextEntry'],
  },

  Slider: {
    moduleName: 'Slider',
    defaultChoiceText: i => `Click to write Choice ${i}`,
    defaultLabelText: i => `Click to write Label ${i}`,
    icon: 'sliders',
    randomization: true,
    defaultValue: true,
    scoring: true,
    scoringFilteredModules: [],
  },

  MetaInfo: {
    moduleName: 'Meta Info Question',
    icon: 'info-circle',
    defaultValue: false,
    hidden: true,
    randomization: false,
  },

  RankOrder: {
    moduleName: 'Rank Order',
    defaultChoiceText: i => `Click to write Item ${i}`,
    icon: 'sort',
    validations: {
      RadioButtons: ['MustRankAll', 'MustRankBetween'],
      TextBox: ['MustRankAll', 'MustRankBetween'],
      SelectBox: ['MustRankAll'],
    },
    randomization: false,
    defaultValue: true,
  },

  SideBySide: {
    moduleName: 'Side by Side',
    defaultChoiceText: i => `Click to write Statement ${i}`,
    defaultGroupText: i => `Click to write Group ${i}`,
    defaultAnswerText: i => `Answer ${i}`,
    icon: 'braille',
    defaultColumn: {
      type: 'Likert',
      likertType: 'SingleAnswer',
      textType: 'Medium',
      text: '',
      answers: 2,
      answersTexts: ['', ''],
    },
    randomization: false,
    defaultValue: true,
    scoring: true,
    scoringFilteredModules: [],
  },

  GapAnalysis: {
    moduleName: 'Gap Analysis',
    defaultCategory: [{
      texts: ['Why', 'Why', 'Why'],
    }],
    defaultCategoryText: i => `Click to write Category ${i}`,
    defaultAnswerText: () => 'Why',
    icon: 'smile-o',
    randomization: false,
    defaultValue: false,
  },

  ConstantSum: {
    moduleName: 'Constant Sum',
    defaultChoiceText: i => `Click to write Choice ${i}`,
    defaultLabelText: i => `Click to write Label ${i}`,
    icon: 'align-left',
    validations: {
      Choice: ['MustTotal'],
      Bar: ['MustTotal'],
      Slider: ['MustTotal'],
    },
    randomization: true,
    defaultValue: true,
  },

  PickGroupRank: {
    moduleName: 'Pick, Group and Rank',
    defaultChoiceText: i => `Click to write Item ${i}`,
    defaultScalePointText: i => `Click to write Group ${i}`,
    icon: 'reorder',
    validations: ['MustSelect', 'EachGroupContains'],
    randomization: false,
    defaultValue: true,
    scoring: true,
  },

  Timing: {
    moduleName: 'Timing',
    icon: 'clock-o',
    randomization: false,
    defaultValue: false,
  },

  Captcha: {
    moduleName: 'Captcha Verification',
    icon: 'universal-access',
    validations: {},
    defaultValue: false,
    randomization: false,
  },

  HotSpot: {
    moduleName: 'Hot Spot',
    defaultChoiceText: i => `Shape ${i}`,
    icon: 'clone',
    validations: ['LeastHotSpot', 'RangeHotSpot'],
    randomization: false,
    defaultValue: true,
  },

  GraphicSlider: {
    moduleName: 'Graphic Slider',
    icon: 'sort-numeric-desc',
    randomization: false,
  },

  VideoResponse: {
    moduleName: 'Video Response',
    icon: 'video-camera',
    randomization: false,
  },
}

export default ModuleConfigs
