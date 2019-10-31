/* eslint-disable react/no-danger */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import I18nStore from 'store/I18nStore'
import styles from './SideBySide.scss'
import TableHeader from './TableHeaderPreview'
import TableBody from './TableBodyPreview'

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
    const { model } = this.props
    return (
      <div style={{ position: 'relative' }}>
        <div className={styles.questionText}>
          <div
            className={styles.questionTextPreview}
            dangerouslySetInnerHTML={{ __html: I18nStore.tQuestion(model, 'questionText') }}
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

export default Preview
