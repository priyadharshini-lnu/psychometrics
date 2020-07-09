import React, { Component } from 'react'
import _ from 'lodash'
import ResultStore from 'rb/store/ResultStore'
import AppStore from 'rb/store/AppStore'
import I18nStore from 'rb/store/I18nStore'
import store from 'rb/store/PropertyPanelStore'
import styles from './CPIOccupations.scss'

class CPIOccupations extends Component {
  componentDidMount () {
    this.propPanelListener = store.addListener('change', () => this.forceUpdate())
  }

  componentWillUnmount () {
    this.propPanelListener.remove()
  }

  prepareRows () {
    const { module } = this.props
    const { props } = module
    let occupations
    let offset = (props.pageNumber || 1) - 1
    const limit = props.itemsPerPage || 10
    if (ResultStore.realResults) {
      occupations = ResultStore.results[module.assessment_id].getOccupations()
    } else {
      const assessment = _.find(AppStore.assessments, { id: module.assessment_id })
      const dimensionId = assessment && assessment.dimensionId
      offset = 0
      occupations = _.map(AppStore.occupations[dimensionId], (oc, i) => ({
        id: oc.id,
        stars: (i % 5) + 1,
        name: I18nStore.tOccupation(oc, 'name'),
        icon: oc.icon,
        color: oc.color,
      }))
    }
    this.occupations = _.slice(occupations, offset, offset + limit)
  }

  renderStars (occupation) {
    return (
      <div className={styles.stars}>
        {_.times(occupation.stars, i => (
          <i key={i} className={`${styles.star} ${styles.full}`} />
        ))}
        {_.times(5 - occupation.stars, i => (
          <i key={i} className={styles.star} />
        ))}
      </div>
    )
  }

  render () {
    const { module: model } = this.props
    const { fontSize, fontFamily, width } = model.props.style
    const style = {
      fontSize,
      fontFamily,
      width,
    }
    this.prepareRows()
    return (
      <div className={styles.table}>
        <div style={style}>
          {_.map(this.occupations, oc => (
            <div className={styles.row} key={oc.id}>
              <div className={styles.icon}><img src={oc.icon} /></div>
              <div className={styles.name}>{I18nStore.tOccupation(oc, 'name')}</div>
              {this.renderStars(oc)}
            </div>
          ))}
        </div>
      </div>
    )
  }
}

export default CPIOccupations
