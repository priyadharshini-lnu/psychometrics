import React, { Component, lazy, Suspense } from 'react'
import { Spin } from 'antd'
import PropTypes from 'prop-types'
import { Modules } from 'components/modules'
import QuestionSerializer from 'models/QuestionSerializer'
import styles from './Question.scss'

const TextEntryBuilder = lazy(() => import('modules/survey/components/modules/TextEntry/TextEntry'))
const SideBySideBuiler = lazy(() => import('modules/survey/components/modules/SideBySide/SideBySide'))

class QuestionRenderer extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  renderModule () {
    const { model } = this.props
    const View = Modules[model.type] || Modules.MultipleChoice
    return <View {...this.props} model={QuestionSerializer.wrap(model)} />
  }

  render () {
    const {
      model,
      model: { type },
    } = this.props

    const notLazyLoadedYet = type !== 'TextEntry' && type !== 'SideBySide'

    return (
      <div className={styles.contentOuter}>
        <Suspense fallback={<Spin />}>
          {type === 'TextEntry' && (
            <TextEntryBuilder {...this.props} model={QuestionSerializer.wrap(model)} />
          )}
          {type === 'SideBySide' && (
            <SideBySideBuiler {...this.props} model={QuestionSerializer.wrap(model)} />
          )}
        </Suspense>
        {notLazyLoadedYet && this.renderModule()}
      </div>
    )
  }
}

export default QuestionRenderer
