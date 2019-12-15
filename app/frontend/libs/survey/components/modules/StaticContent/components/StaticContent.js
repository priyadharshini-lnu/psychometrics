import React, { Component } from 'react'
import PropTypes from 'prop-types'
import TextEditor from 'components/TextEditor'
import styles from './StaticContent.scss'
import Templates from './Templates'

export class Preview extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeText = (value) => {
    const { model } = this.props
    model.changeProps({ questionText: value })
    this.forceUpdate()
  }

  renderType () {
    const { model, model: { props: { type } } } = this.props
    if (type === 'Text') { return null }
    const View = Templates[type]
    return <View model={model} key={type} />
  }

  renderText (props) {
    const { model } = this.props
    const { type } = props
    const { graphicType } = props
    if (type === 'Text' || (type === 'Graphic' && (graphicType === 'WithText' || graphicType === 'UrlWithText'))) {
      return (
        <div className={styles.questionText}>
          <TextEditor model={model} value={props.questionText} onChange={this.changeText} />
        </div>
      )
    }
  }

  render () {
    const { model: { props } } = this.props
    return (
      <div>
        {this.renderText(props)}
        {this.renderType(props)}
      </div>
    )
  }
}

export default Preview
