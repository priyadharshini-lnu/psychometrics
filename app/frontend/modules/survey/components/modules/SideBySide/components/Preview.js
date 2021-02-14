import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { SafeHTML } from 'components/SafeHTML'

import styles from './SideBySide.scss'
import TableHeader from './TableHeaderPreview'
import TableBody from './TableBodyPreview'
import connect from '../connect'

export class Preview extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeText = (value) => {
    const { model } = this.props
    model.props.questionText = value
    model.update()
    this.forceUpdate()
  }

  update = () => {
    this.forceUpdate()
  }

  render () {
    const { model, I18n } = this.props
    return (
      <div style={{ position: 'relative' }}>
        <div className={styles.questionText}>
          <SafeHTML
            className={styles.questionTextPreview}
            html={I18n.tQuestion(model, 'questionText')}
            config="adminRichText"
          />
        </div>
        <table className={styles.preview}>
          <TableHeader {...this.props} />
          <TableBody {...this.props} />
        </table>
      </div>
    )
  }
}

export default connect(Preview)
