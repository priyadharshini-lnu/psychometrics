import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Question from 'views/Question'
import PageBreak from 'components/PageBreak'
import styles from './QuestionList.scss'

export class QuestionList extends Component {
  static propTypes = {
    block: PropTypes.object.isRequired,
  }

  storeListener = null

  componentDidMount () {
    const { block } = this.props
    this.storeListener = block.questions.addListener('change', () => this.forceUpdate())
  }

  componentWillUnmount () {
    this.storeListener.remove()
  }

  render () {
    const { block } = this.props
    const store = block.questions
    const { list } = store
    return (
      <div className={styles.main}>
        {list.map((question, i) => {
          if (question.type === 'PageBreak') {
            return <PageBreak store={store} model={question} key={i} />
          }
          return <Question store={store} model={question} key={i} />
        })}
      </div>
    )
  }
}

export default QuestionList
