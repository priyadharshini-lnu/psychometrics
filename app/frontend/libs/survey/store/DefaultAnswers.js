const DefaultAnswers = {
  StaticContent: {
  },

  MultipleChoice: {
    choices: 3,
    choicesTexts: ['', '', ''],
    questionText: 'Click to write the question text',
    type: 'SingleAnswer',
    position: 'Vertical',
  },

  TextEntry: {
    choices: 3,
    choicesTexts: ['', '', ''],
    questionText: 'Click to write the question text',
    type: 'SingleLine',
  },

  MatrixTable: {
    choices: 3,
    scalePoints: 3,
    labels: 0,
    choicesTexts: ['', '', ''],
    scalePointsTexts: ['', '', ''],
    labelsTexts: [],
    questionText: 'Click to write the question text',
    type: 'Likert',
    answersType: 'SingleAnswer',
    totalBoxType: 'Statement',
    symbolType: 'None',
    symbol: '',
    textEntrySize: 'Short',
  },

  Slider: {
    choices: 3,
    choicesTexts: ['', '', ''],
    hideChoiceText: false,
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
    results: [20, 10, 30],
    resultsStars: [4, 1, 2],
  },

  RankOrder: {
    choices: 3,
    choicesTexts: ['', '', ''],
    questionText: 'Click to write the question text',
    type: 'DragAndDrop',
  },

  MetaInfo: {
    choicesTexts: [''],
    questionText: '',
  },

  SideBySide: {
    choices: 3,
    scalePoints: 2,
    choicesTexts: ['', '', ''],
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
  },

  GapAnalysis: {
    choices: 3,
    scalePoints: 3,
    choicesTexts: ['', '', ''],
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
    choicesTexts: ['', '', ''],
    labels: 3,
    labelsTexts: [],
    questionText: 'Click to write the question text',
    type: 'Choice',
    gridLines: 10,
    minValue: 0,
    maxValue: 100,
    numberOfDecimals: 0,
    results: [20, 10, 30],
    symbolType: 'None',
    symbol: '',
    position: 'Vertical',
    options: ['Total Box'],
  },

  PickGroupRank: {
    choices: 3,
    scalePoints: 3,
    choicesTexts: ['', '', ''],
    scalePointsTexts: ['', '', ''],
    questionText: 'Click to write the question text',
    type: 'DragAndDrop',
    columns: false,
    stackItems: false,
    stackItemsGroup: false,
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

  VideoResponse: {
    questionText: 'Click to write the question text',
  },

}

export default DefaultAnswers
