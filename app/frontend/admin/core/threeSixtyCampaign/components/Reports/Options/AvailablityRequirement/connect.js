import { connect } from 'react-redux'

const defaultCondition = [
  {
    operator: "if",
    conditions: [
      {
        operator: "if",
        type: "Evaluation",
        numberOfEvaluator: 3,
        relationship: "Manager"
      },
      {
        operator: "or",
        type: "Evaluation",
        numberOfEvaluator: 1,
        relationship: "Manager"
      },
      {
        operator: "and",
        type: "Evaluation",
        numberOfEvaluator: 1,
        relationship: "Manager"
      }
    ]
  },
  {
    operator: "And",
    conditions: [
      {
        operator: "if",
        type: "Evaluation",
        numberOfEvaluator: 10,
        relationship: "Manager"
      },
      {
        operator: "and",
        type: "Evaluation",
        numberOfEvaluator: 10,
        relationship: "Direct Report"
      }
    ]
  }
]

export default connect(
  state => ({ conditions: defaultCondition }),
  {},
)
