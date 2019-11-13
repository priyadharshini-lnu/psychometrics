import React, { Component } from 'react'
import PropTypes from 'prop-types'
import platform from 'platform'
import styles from './MetaInfo.scss'

const { ActiveXObject } = window
export class MetaInfoPreview extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  componentDidMount () {
    const { model, readOnly } = this.props
    if (readOnly) { return }
    const answer = {
      browser: platform.name,
      version: platform.version,
      os: platform.description.split(' on ')[1],
      screen: `${screen.width}x${screen.height}`,
      flash: this.getFlashVersion(),
      java: navigator.javaEnabled(),
      userAgent: navigator.userAgent,
    }

    model.result.answer(answer)
    this.forceUpdate()
  }

  getFlashVersion () {
    // ie
    try {
      try {
        // avoid fp6 minor version lookup issues
        // see: http://blog.deconcept.com/2006/01/11/getvariable-setvariable-crash-internet-explorer-flash-6/
        const axo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.6')
        try {
          axo.AllowScriptAccess = 'always'
        } catch (e) {
          return '6.0.0'
        }
      } catch (e) { console.warn(e) }
      return new ActiveXObject('ShockwaveFlash.ShockwaveFlash')
        .GetVariable('$version').replace(/\D+/g, '.').match(/^\.?(.+)\.?$/)[1]
    // other browsers
    } catch (e) {
      try {
        if (navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin) {
          return (navigator.plugins['Shockwave Flash 2.0'] || navigator.plugins['Shockwave Flash'])
            .description
            .replace(/\D+/g, '.')
            .match(/^\.?(.+)\.?$/)[1]
        }
      } catch (e) { console.warn(e) }
    }
    return '0.0.0'
  }

  render () {
    const { model: { result: { answers } } } = this.props
    return (
      <div>
        <h4>Browser Meta Info</h4>
        <em>This question will not be displayed to the recipient.</em>
        <ul className={styles.ul}>
          <li>
            Browser:
            <b>{answers.browser}</b>
          </li>
          <li>
            Version:
            <b>{answers.version}</b>
          </li>
          <li>
            Operating System:
            <b>{answers.os}</b>
          </li>
          <li>
            Screen Resolution:
            <b>{answers.screen}</b>
          </li>
          <li>
            Flash Version:
            <b>{answers.flash}</b>
          </li>
          <li>
            Java Support:
            <b>{answers.java ? 'Yes' : 'No'}</b>
          </li>
          <li>
            User Agent:
            <b>{answers.userAgent}</b>
          </li>
        </ul>
      </div>
    )
  }
}

export default MetaInfoPreview
