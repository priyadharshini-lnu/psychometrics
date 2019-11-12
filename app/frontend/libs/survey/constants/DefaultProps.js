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
    questionText: 'Click to write the question text',
    type: 'SingleAnswer',
    position: 'Vertical',
    defaultValues: [],
    notApplicable: false,
    notApplicableLabel: 'Not Applicable',
  },

  TextEntry: {
    choices: 3,
    choicesTexts: ['Click to write Form field 1', 'Click to write Form field 2', 'Click to write Form field 3'],
    questionText: 'Click to write the question text',
    type: 'SingleLine',
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
    }, {
      type: 'Likert',
      likertType: 'SingleAnswer',
      textType: 'Medium',
      text: '',
      answers: 2,
      answersTexts: ['', ''],
    }],
    questionText: 'Click to write the question text',
    repeatHeaders: 'None',
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
  },

}

export default DefaultProps
