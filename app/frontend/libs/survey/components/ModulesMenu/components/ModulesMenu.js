import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './ModulesMenu.scss'

export class ModulesMenu extends Component {
  static propTypes = {
    onSelect: PropTypes.func.isRequired,
    className: PropTypes.string,
  }

  click = (e) => {
    const { onSelect } = this.props
    const type = e.currentTarget.getAttribute('type')
    const { props } = e.currentTarget.dataset
    onSelect && onSelect(type, props ? JSON.parse(props) : null)
  }

  render () {
    let { className } = this.props
    className = `dropdown-menu ${className} ${styles.menu}`
    return (
      <div className={className} role="menu">
        <div className={styles.moduleset}>
          <div className={styles.left}>Static Content</div>
          <div className={styles.right}>
            <a
              onClick={this.click}
              type="StaticContent"
              data-props={JSON.stringify({ type: 'Text' })}
              className={`col-sm-6 ${styles.button}`}
            >
              <span className={`fa fa-paragraph ${styles.icon}`} />
              Descriptive Text
            </a>
            <a
              onClick={this.click}
              type="StaticContent"
              data-props={JSON.stringify({ type: 'Graphic' })}
              className={`col-sm-6 ${styles.button}`}
            >
              <span className={`fa fa-picture-o ${styles.icon}`} />
              Graphic
            </a>
          </div>
        </div>
        <div className={styles.moduleset}>
          <div className={styles.left}>Standard Questions</div>
          <div className={styles.right}>
            <a onClick={this.click} type="MultipleChoice" className={`col-sm-6 ${styles.button}`}>
              <span className={`fa fa-check-square-o ${styles.icon}`} />
              Multiple Choice
            </a>
            <a onClick={this.click} type="MatrixTable" className={`col-sm-6 ${styles.button}`}>
              <span className={`fa fa-table ${styles.icon}`} />
              Matrix Table
            </a>
            <a onClick={this.click} type="TextEntry" className={`col-sm-6 ${styles.button}`}>
              <span className={`fa fa-font ${styles.icon}`} />
              Text Entry
            </a>
            <a onClick={this.click} type="Slider" className={`col-sm-6 ${styles.button}`}>
              <span className={`fa fa-sliders ${styles.icon}`} />
              Slider
            </a>
            <a onClick={this.click} type="RankOrder" className={`col-sm-6 ${styles.button}`}>
              <span className={`fa fa-sort ${styles.icon}`} />
              Rank Order
            </a>
            <a onClick={this.click} type="SideBySide" className={`col-sm-6 ${styles.button}`}>
              <span className={`fa fa-braille ${styles.icon}`} />
              Side by Side
            </a>
          </div>
        </div>
        <div className={styles.moduleset}>
          <div className={styles.left}>Speciality Questions</div>
          <div className={styles.right}>
            <a onClick={this.click} type="ConstantSum" className={`col-sm-6 ${styles.button}`}>
              <span className={`fa fa-align-left ${styles.icon}`} />
              Constant Sum
            </a>
            <a onClick={this.click} type="PickGroupRank" className={`col-sm-6 ${styles.button}`}>
              <span className={`fa fa-reorder ${styles.icon}`} />
              Pick, Group and Rank
            </a>
            <a onClick={this.click} type="HotSpot" className={`col-sm-6 ${styles.button}`}>
              <span className={`fa fa-clone ${styles.icon}`} />
              Hot Spot
            </a>
            <a onClick={this.click} type="GraphicSlider" className={`col-sm-6 ${styles.button}`}>
              <span className={`fa fa-sort-numeric-desc ${styles.icon}`} />
              Graphic Slider
            </a>
            <a onClick={this.click} type="GapAnalysis" className={`col-sm-6 ${styles.button}`}>
              <span className={`fa fa-smile-o ${styles.icon}`} />
              Gap Analysis
            </a>
            <a onClick={this.click} type="VideoResponse" className={`col-sm-6 ${styles.button}`}>
              <span className={`fa fa-video-camera ${styles.icon}`} />
              Video Response
            </a>
          </div>
        </div>
        <div className={styles.moduleset}>
          <div className={styles.left}>Advanced</div>
          <div className={styles.right}>
            <a onClick={this.click} type="Timing" className={`col-sm-6 ${styles.button}`}>
              <span className={`fa fa-clock-o ${styles.icon}`} />
              Timing
            </a>
            <a onClick={this.click} type="MetaInfo" className={`col-sm-6 ${styles.button}`}>
              <span className={`fa fa-info-circle ${styles.icon}`} />
              Meta Info Question
            </a>
            <a onClick={this.click} type="Captcha" className={`col-sm-6 ${styles.button}`}>
              <span className={`fa fa-universal-access ${styles.icon}`} />
              Captcha Verification
            </a>
          </div>
        </div>
      </div>
    )
  }
}

export default ModulesMenu
