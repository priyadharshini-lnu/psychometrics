import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './ChartsMenu.scss'

export class ChartsMenu extends Component {
  static propTypes = {
    onSelect: PropTypes.func.isRequired,
    className: PropTypes.string,
  }

  click = (e) => {
    const { onSelect } = this.props
    const type = e.currentTarget.getAttribute('type')
    const presetName = e.currentTarget.dataset.preset
    onSelect && onSelect(type, presetName)
  }

  render () {
    const { model, className: cn } = this.props
    const icons = model.moduleConfig.chartsIcons
    const className = `dropdown-menu ${cn} ${styles.menu}`
    return (
      <div className={className} role="menu">
        <div className={styles.innerMenu}>
          <div className={styles.chartIcon} type="Bar" data-preset="VerticalBar" onClick={this.click}>
            <span className={`${styles[icons.Bar]} ${styles.icon}`} />
          </div>
          <div className={styles.chartIcon} type="Bar" data-preset="VerticalBar3D" onClick={this.click}>
            <span className={`${styles[icons.Bar3D]} ${styles.icon}`} />
          </div>
          <div className={styles.chartIcon} type="Bar" data-preset="HorizontalBar" onClick={this.click}>
            <span className={`${styles[icons.HorizontalBar]} ${styles.icon}`} />
          </div>
          <div className={styles.chartIcon} type="Bar" data-preset="HorizontalBar3D" onClick={this.click}>
            <span className={`${styles[icons.HorizontalBar3D]} ${styles.icon}`} />
          </div>
          <div className={styles.chartIcon} type="Pie" data-preset="Pie" onClick={this.click}>
            <span className={`${styles[icons.Pie]} ${styles.icon}`} />
          </div>
          <div className={styles.chartIcon} type="Pie" data-preset="Pie3D" onClick={this.click}>
            <span className={`${styles[icons.Pie3D]} ${styles.icon}`} />
          </div>
          <div className={styles.chartIcon} type="Line" data-preset="Line" onClick={this.click}>
            <span className={`${styles[icons.Line]} ${styles.icon}`} />
          </div>
          <div className={styles.chartIcon} type="Line" data-preset="Point" onClick={this.click}>
            <span className={`${styles.Point} ${styles.icon}`} />
          </div>
          <div className={styles.chartIcon} type="TagCloud" onClick={this.click}>
            <span className={`${styles.TagCloud} ${styles.icon}`} />
          </div>
          <div className={styles.chartIcon} type="Pie" data-preset="Doughnut" onClick={this.click}>
            <span className={`${styles.Doughnut} ${styles.icon}`} />
          </div>
          <div className={styles.chartIcon} type="Pie" data-preset="Doughnut3D" onClick={this.click}>
            <span className={`${styles.Doughnut3D} ${styles.icon}`} />
          </div>
          <div className={styles.chartIcon} type="Gauge" data-preset="SpeedometerA" onClick={this.click}>
            <span className={`${styles.SpeedometerA} ${styles.icon}`} />
          </div>
          <div className={styles.chartIcon} type="Radar" data-preset="RadarA" onClick={this.click}>
            <span className={`${styles.RadarA} ${styles.icon}`} />
          </div>
          <div className={styles.chartIcon} type="CustomPie" data-preset="CustomPie" onClick={this.click}>
            <span className={`${styles.CustomPie} ${styles.icon}`} />
          </div>
          <div className={styles.chartIcon} type="StackedBar" data-preset="HorizontalStackedBar" onClick={this.click}>
            <span className={`${styles.HorizontalStackedBar} ${styles.icon}`} />
          </div>
          <div className={styles.chartIcon} type="StackedBar" data-preset="VerticalStackedBar" onClick={this.click}>
            <span className={`${styles.VerticalStackedBar} ${styles.icon}`} />
          </div>
          <div className={styles.chartIcon} type="Engagometer" data-preset="Engagometer" onClick={this.click}>
            <span className={`${styles.Engagometer} ${styles.icon}`} />
          </div>
          <div className={styles.chartIcon} type="Circumplex" data-preset="Circumplex" onClick={this.click}>
            <span className={`${styles.Circumplex} ${styles.icon}`} />
          </div>
          <div className={styles.chartIcon} type="Consultant" data-preset="Consultant" onClick={this.click}>
            <span className={`${styles.Consultant} ${styles.icon}`} />
          </div>
        </div>
      </div>
    )
  }
}

export default ChartsMenu
