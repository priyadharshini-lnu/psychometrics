import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Timer from './Timer'

export class Timing extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  click = () => {
  }

  enableSubmit = () => {
  }

  autoAdvance = () => {
  }

  render () {
    const { model } = this.props
    return (
      <div>
        <p>
          This question lets you record and manage how long a participant spends on this page.
          This question will not be displayed to the participant.
        </p>
        <div>
          <Timer
            model={model}
            startTimer={false}
            onBodyClick={this.click}
            onEnableSubmit={this.enableSubmit}
            onAutoAdvance={this.autoAdvance}
          />
        </div>
      </div>
    )
  }
}

export default Timing
