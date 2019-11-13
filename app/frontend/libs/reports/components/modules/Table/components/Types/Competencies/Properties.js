import React, { Component } from 'react'
import store from 'rb/store/PropertyPanelStore'
import ColorSet from 'rb/components/ColorSet'
import styles from 'rb/views/PropertyPanel/components/PropertyPanel.scss'
import PropertyFilter from 'rb/components/PropertyFilter'
import ColorPicker from 'rb/components/ColorPicker'
import PropertyFonts from 'rb/components/PropertyFonts'
import SourceTypeButtonGroup from '../../SourceTypeButtonGroup'
import MilestoneList from './MilestoneList'
import dataSources from '../SingleValue/dataSources'

export default class Properties extends Component {
  onChange = (key, value) => {
    store.model.props[key] = value
    store.model.update()
    this.forceUpdate()
  }

  render () {
    const { model } = store
    const DataSource = dataSources[model.props.sourceType]

    return (
      <div>
        <div>Font</div>
        <PropertyFonts colors={false} />

        <div className={styles.title}>Competencies</div>
        <SourceTypeButtonGroup model={model} onChange={this.onChange} />
        <DataSource model={model} onChange={this.onChange} />
        <div className="mtm">
          <PropertyFilter />
        </div>
        <div className={styles.block}>
          Header Colours
          <div className={styles.flexRow}>
            <ColorPicker
              color={model.props.mainHeaderColor}
              onChange={color => this.onChange('mainHeaderColor', color.hex)}
            />
            <ColorPicker
              color={model.props.secondHeaderColor}
              onChange={color => this.onChange('secondHeaderColor', color.hex)}
            />
          </div>
        </div>
        <div className="margin-top-10">
          Show
          <div className={styles.flexRow}>
            <label className={styles.inputLabel}>
              <input
                style={{ marginRight: '5px' }}
                type="checkbox"
                checked={store.model.props.showLabels}
                onChange={e => this.onChange('showLabels', e.currentTarget.checked)}
              />
              Labels
            </label>
            <label className={styles.inputLabel}>
              <input
                style={{ marginRight: '5px' }}
                type="checkbox"
                checked={store.model.props.showValues}
                onChange={e => this.onChange('showValues', e.currentTarget.checked)}
              />
              Values
            </label>
            <label className={styles.inputLabel}>
              <input
                style={{ marginRight: '5px' }}
                type="checkbox"
                checked={store.model.props.showLines}
                onChange={e => this.onChange('showLines', e.currentTarget.checked)}
              />
              Lines
            </label>
          </div>
        </div>
        <div className="mtm">
          <ColorSet model={model} />
        </div>
        <MilestoneList model={model} />
      </div>
    )
  }
}
