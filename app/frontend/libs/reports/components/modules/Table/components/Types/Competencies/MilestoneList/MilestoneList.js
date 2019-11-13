import React, { Component } from 'react'
import cs from 'classnames'
import Utils from 'rb/utils/Utils'
import Milestone from './Milestone'
import styles from './styles.scss'

export default class MilestoneList extends Component {
  addMilestone = () => {
    const { model } = this.props
    model.props.milestones = [
      ...model.props.milestones,
      {
        min: '',
        max: '',
        name: '',
        id: Utils.genId(),
      },
    ]
    this.update()
  }

  removeMilestone = ({ id }) => {
    const { model } = this.props
    model.props.milestones = model.props.milestones.filter(m => m.id !== id)
    this.update()
  }

  updateMilestone = (id, attrs) => {
    const { model } = this.props
    model.props.milestones = model.props.milestones.map((m) => {
      if (m.id !== id) {
        return m
      }
      return { ...m, ...attrs }
    })
    this.update()
  }

  update = () => {
    const { model } = this.props
    model.update()
    this.forceUpdate()
  }

  render () {
    const { model: { props: { milestones } } } = this.props

    return (
      <div className="mts">
        <div>
          <span>Score Ranges</span>
          <i className={cs('fa', 'fa-plus', 'mls', styles.add)} onClick={this.addMilestone} />
        </div>
        <div>
          {milestones.map(milestone => (
            <Milestone
              onUpdate={this.updateMilestone}
              onRemove={this.removeMilestone}
              key={milestone.id}
              milestone={milestone}
            />
          ))}
        </div>
      </div>
    )
  }
}
