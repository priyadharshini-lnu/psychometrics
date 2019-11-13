
export default {
  MultipleChoice: () => [{
    value: 'AllChoices', label: 'All Choices',
  }],

  MatrixTable: question => _.map(question.props.choicesTexts, (choice, index) => ({
    value: `${index}`, label: choice,
  })),

  Slider: question => _.map(question.choicesTexts, (choice, index) => ({
    value: `${index}`, label: choice,
  })),

  RankOrder: question => _.map(question.choicesTexts, (choice, index) => ({
    value: `${index}`, label: choice,
  })),

  SideBySide: question => _.flatten(_.map(question.props.columnsData, (column, scale) => (
    question.props.choicesTexts.map((choice, index) => (
      { value: `${scale},${index}`, label: `${column.text || `Scale text ${scale + 1} - ${choice}`}` }
    ))
  ))),

  GapAnalysis: question => _.map(question.props.choicesTexts, (choice, index) => ({
    value: `${index}`, label: choice,
  })),

  ConstantSum: question => _.map(question.props.choicesTexts, (choice, index) => ({
    value: `${index}`, label: choice,
  })),

  PickGroupRank: question => _.flatten(_.map(question.props.scalePointsTexts,
    (scale, sIndex) => _.map(question.props.choicesTexts, (choice, cIndex) => ({
      value: `${sIndex},${cIndex}`, label: `${scale} - ${choice}`,
    })))),
}
