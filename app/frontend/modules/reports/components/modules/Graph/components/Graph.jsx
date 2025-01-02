import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Foundation from '~/modules/reports/components/Foundation'
import { getFlatFactors } from '~/modules/reports/core/builder/selectors'
import styles from './Graph.less'
import Charts from './Charts'
import {
  joinStyles, convertColor, useAssignStyle,
} from '../../CommonMethods/styles'

const assignStyle = useAssignStyle('Graph')

class Graph extends Component {
  static propTypes = {
    module: PropTypes.object.isRequired,
    page: PropTypes.object.isRequired,
    animation: PropTypes.bool,
    preview: PropTypes.bool,
  }


  state = {
    isRTL: false,
  }

  componentDidMount () {
    const { availableLanguages } = this.props
    const lang = new URLSearchParams(window.location.search).get('lang') || 'en'
    const isRTL = availableLanguages.find(l => l.code === lang)?.direction === 'rtl' || false
    this.setState({ isRTL })
  }

  renderGraph () {
    const {
      factors, module: model, preview, animation, reportStyles,
    } = this.props
    let colorOverrides = null
    if (model.textConditions.length > 0) {
      const {
        colors,
      } = model.getStylesByCondition()
      if (colors) {
        model.props.colors = colors
        colorOverrides = colors
      }
    }

    const moduleStyles = model.props.style
    const style = joinStyles(reportStyles, model.props.styleIds)
    style.fontColor = assignStyle(style, 'color', convertColor(moduleStyles.fontColor), 'Graph')
    style.fontSize = assignStyle(style, 'fontSize', moduleStyles.fontSize, 'Graph')
    style.fontFamily = assignStyle(style, 'fontFamily', moduleStyles.fontFamily, 'Graph')

    model.props.style = style
    const { isRTL } = this.state

    if (model.props.type) {
      const View = Charts[model.props.type] || Charts.Bar
      return (
        <View
          factors={factors}
          model={model}
          preview={preview}
          animation={animation}
          colorOverrides={colorOverrides}
          isRTL={isRTL}
        />
      )
    }
    return 'Choose Graph Type'
  }

  render () {
    const { module, reportStyles } = this.props
    const style = joinStyles(reportStyles, module.props.styleIds)

    const outerStyle = {}
    outerStyle.borderRadius = style.borderRadius

    if (style.boxShadow?.enabled) {
      const {
        x, y, blur, spread = 0, color = '#000000',
      } = style.boxShadow
      outerStyle.boxShadow = `${x || 0}px ${y || 0}px ${blur || 0}px ${spread || 0}px ${color}`
    }

    return (
      <Foundation {...this.props} aspectRatio={false} outerStyle={outerStyle}>
        <div className={styles.graph}>
          {this.renderGraph()}
        </div>
      </Foundation>
    )
  }
}

export default connect(
  state => ({
    factors: getFlatFactors(state),
  }),
  {},
)(Graph)
