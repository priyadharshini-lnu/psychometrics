const DefaultProps = {
  StaticContent: {
    questionText: 'Click to write the question text',
    hasValidations: false,
    type: 'Text',
    graphicType: 'NoText',
    graphicUrl: '',
  },

  MultipleChoice: {
    choices: 3,
    choicesTexts: ['Click to write Choice 1', 'Click to write Choice 2', 'Click to write Choice 3'],
    choicesImages: ['', '', ''],
    questionText: 'Click to write the question text',
    type: 'SingleAnswer',
    position: 'Vertical',
    defaultValues: [],
    notApplicable: false,
    notApplicableLabel: 'Not Applicable',
    withImageChoice: false,
    isImagePreviewEnable: false,
    imageChoiceSize: 'small',
  },

  TextEntry: {
    choices: 3,
    choicesTexts: ['Click to write Form field 1', 'Click to write Form field 2', 'Click to write Form field 3'],
    questionText: 'Click to write the question text',
    type: 'SingleLine',
    allowDictation: false,
    dateFormat: 'DD-MM-YYYY',
    defaultValues: [],
  },

  MatrixTable: {
    choices: 3,
    scalePoints: 3,
    labels: 0,
    choicesTexts: ['Click to write Choice 1', 'Click to write Choice 2', 'Click to write Choice 3'],
    scalePointsTexts: ['', '', ''],
    labelsTexts: [],
    questionText: 'Click to write the question text',
    type: 'Likert',
    answersType: 'SingleAnswer',
    totalBoxType: 'Statement',
    symbolType: 'None',
    symbol: '',
    textEntrySize: 'Short',
    defaultValues: [],
    notApplicable: false,
    notApplicableLabel: 'Not Applicable',
  },

  Slider: {
    choices: 3,
    choicesTexts: ['Click to write Choice 1', 'Click to write Choice 2', 'Click to write Choice 3'],
    labels: 3,
    labelsTexts: [],
    questionText: 'Click to write the question text',
    notApplicable: false,
    notApplicableLabel: 'Not Applicable',
    type: 'Slider',
    gridLines: 10,
    minValue: 0,
    maxValue: 100,
    numberOfDecimals: 0,
    stars: 5,
    interaction: 'Discrete',
    fakeResults: [20, 10, 30],
    fakeResultsStars: [4, 1, 2],
    defaultValues: [],
  },

  RankOrder: {
    choices: 3,
    choicesTexts: ['Click to write Item 1', 'Click to write Item 2', 'Click to write Item 3'],
    questionText: 'Click to write the question text',
    type: 'DragAndDrop',
    defaultValues: [],
    descriptionList: [],
  },

  MetaInfo: {
    choicesTexts: [''],
    questionText: '',
  },

  SideBySide: {
    choices: 3,
    scalePoints: 2,
    choicesTexts: ['Click to write Statement 1', 'Click to write Statement 2', 'Click to write Statement 3'],
    columnsData: [{
      type: 'Likert',
      likertType: 'SingleAnswer',
      textType: 'Medium',
      text: '',
      answers: 2,
      answersTexts: ['', ''],
      isHeaderHidden: false,
    }, {
      type: 'Likert',
      likertType: 'SingleAnswer',
      textType: 'Medium',
      text: '',
      answers: 2,
      answersTexts: ['', ''],
      isHeaderHidden: false,
    }],
    questionText: 'Click to write the question text',
    repeatHeaders: 'None',
    isRowDescriptionEnabled: false,
    rowDescriptions: [''],
    f: [{ scale: 0, choice: 1, value: '11111' }],
    defaultValues: [],
  },

  GapAnalysis: {
    choices: 3,
    scalePoints: 3,
    choicesTexts: ['Click to write Category 1', 'Click to write Category 2', 'Click to write Category 3'],
    type: 'Positive',
    categoriesData: [{
      texts: ['Why', 'Why', 'Why'],
    }, {
      texts: ['Why', 'Why', 'Why'],
    }, {
      texts: ['Why', 'Why', 'Why'],
    }],
    questionText: 'Click to write the question text',
    tellUsText: 'Tell Us Why',
    categoriesText: 'Categories',
  },
  ConstantSum: {
    choices: 3,
    choicesTexts: ['Click to write Choice 1', 'Click to write Choice 2', 'Click to write Choice 3'],
    labels: 3,
    labelsTexts: [],
    questionText: 'Click to write the question text',
    type: 'Choice',
    gridLines: 10,
    minValue: 0,
    maxValue: 100,
    numberOfDecimals: 0,
    fakeResults: [20, 10, 30],
    symbolType: 'None',
    symbol: '',
    position: 'Vertical',
    options: ['Total Box'],
    defaultValues: [],
  },

  PickGroupRank: {
    choices: 3,
    scalePoints: 3,
    choicesTexts: ['Click to write Item 1', 'Click to write Item 2', 'Click to write Item 3'],
    scalePointsTexts: ['', '', ''],
    questionText: 'Click to write the question text',
    type: 'DragAndDrop',
    columns: false,
    stackItems: false,
    stackItemsGroup: false,
    defaultValues: [],
  },

  Timing: {
    enableSubmitAfter: 0,
    autoAdvanceAfter: 0,
    showTimer: false,
    timerCountDown: true,
    seconds: 0,
  },

  Captcha: {
    questionText: 'Click to write the question text',
  },

  HotSpot: {
    graphicUrl: false,
    regions: [],
    regionsNames: [],
    interactivity: 'Switcher',
    alwaysVisible: true,
    defaultValues: [],
  },

  GraphicSlider: {
    questionText: 'Click to write the question text',
    textPosition: 'above',
    sliderPosition: 'vertical',
    category: 'gauges',
    modification: 'gauge',
    barType: 'horizontal_bars',
    value: 0,
    max: 10,
    min: 0,
    sliderMargin: 0,
    labelLow: '',
    labelHigh: '',
    enableLabels: false,
  },

  VideoResponse: {
    questionText: 'Click to write the question text',
    duration: 10,
    maxTakes: '',
  },

  FileUpload: {
    questionText: 'Click to write the question text',
    maxFileSize: 1,
    allowedFileTypes: ['pdf'],
  },

  AudioResponse: {
    questionText: 'Click to write the question text',
    duration: 10,
  },
  CampaignFactorFeedback: {
    questionText: 'Click to write the question text',
    minFactors: 3,
    maxFactors: 3,
    skillLabel: 'Skill {{index}}',
    feedbackLabel: 'Feedback',
    factorLabel: 'Skill factor',
  },

  FactorSelect: {
    questionText: 'Click to write the question text',
    type: 'Dropdown',
    defaultValues: [],
  },
}

export const TextEntryProps = {
  Chat: {
    choices: 1,
    title: 'Chat With Manager',
    titleDescription: 'Chat with your manager to discuss about the feedback on the recent project',
    managerName: 'Rupert Smith',
    messageList: [
      { type: 'their', text: 'Hi, James', position: 0 },
      { type: 'mine', text: 'Ok Rupert', position: 1 },
    ],
    defaultValues: [],
  },
  Email: {
    title: 'How will you communicate?',
    titleDescription: 'Write an email to your manager',
    contactList: ['Rupert Smith'],
    maxLength: 120,
    defaultValues: {},
    choices: 0,
  },
  Form: {
    choices: 3,
  },
}

export const DefaultTrackerOptions = {
  upperHalfBody: {
    box: {
      x: 0.2,
      y: 0.0,
      width: 0.6,
      height: 0.6,
    },
    object: {
      size: 0.4,
      threshold: 0.2,
    },
  },
  face: {
    box: {
      x: 0.01,
      y: 0.01,
      width: 0.98,
      height: 0.98,
    },
    object: {
      size: 0.6,
      threshold: 0.3,
    },
  },
  custom: {
    box: {
      x: 0,
      y: 0,
      height: 0,
      width: 0,
    },
    object: {
      size: 0,
      threshold: 0,
    },
  },
}

export default DefaultProps
