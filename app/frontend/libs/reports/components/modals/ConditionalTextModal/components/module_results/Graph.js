import React, { Component } from 'react'
import ColorSet from 'rb/components/ColorSet'
import styles from '../ConditionalTextModal.scss'

export default class ConditionCollection extends Component {
  constructor (props) {
    super(props)
    this.state = {
      model: {
        props: {
          colors: props.model.styles.colors || [
            { id: 1, color: '#4572A7' },
            { id: 2, color: '#AA4643' },
            { id: 3, color: '#89A54E' },
            { id: 4, color: '#71588F' },
            { id: 5, color: '#4198AF' },
            { id: 6, color: '#DB843D' },
            { id: 7, color: '#93A9CF' },
            { id: 8, color: '#D19392' },
            { id: 9, color: '#B9CD96' },
            { id: 10, color: '#A99BBD' },
          ],
        },
        update: colors => this.update(colors),
      },
    }
  }

  update = (colors) => {
    const { model } = this.props
    model.styles = { colors }
    this.forceUpdate()
  }

  render () {
    const { model } = this.state
    return (
      <div>
      Then use the following colors:
        <div className={styles.stylesBlock} style={{ position: 'relative' }}>
          <ColorSet model={model} />
        </div>
      </div>
    )
  }
}
