import { connect } from 'react-redux'

export default connect(
  ({ preview: { inProgressQuestions } }) => ({
    inProgressQuestions
  })
)
