import { Component } from 'react'
import _ from 'lodash'
import ResultStore from '~/modules/reports/store/ResultStore'
import AppStore from '~/modules/reports/store/AppStore'
import I18nStore from '~/modules/reports/store/I18nStore'
import store from '~/modules/reports/store/PropertyPanelStore'
import styles from './CPIOccupations.less'

class CPIOccupations extends Component {
  componentDidMount () {
    this.propPanelListener = store.addListener('change', () => this.forceUpdate())
  }

  componentWillUnmount () {
    this.propPanelListener.remove()
  }

  prepareRows () {
    const { module } = this.props
    const {
      pageNumber, itemsPerPage, sortBy = 'name', sortOrder = 'asc',
    } = module.props
    let occupations
    let offset = (pageNumber || 1) - 1
    const limit = itemsPerPage || 10
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
        value: Math.random(),
      }))
    }
    occupations = _.orderBy(occupations, sortBy, sortOrder)
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

  renderBars (occupation) {
    const { module: model } = this.props
    const { barColor = '#ccc' } = model.props.style

    const value = Math.round(occupation.value * 10)
    const style = { backgroundColor: barColor, opacity: 0.15 }
    const filledStyle = { backgroundColor: barColor, opacity: 1 }
    return (
      <div className={styles.bars}>
        {_.times(10, i => (
          <div
            key={i}
            className={styles.bar}
            style={{
              ...style,
              ...(i + 1 <= value ? filledStyle : {}),
            }}
          />
        ))}
      </div>
    )
  }

  renderValues (occupation) {
    const value = Math.round(occupation.value * 100)
    return (
      <div className={styles.value}>
        {value}
        %
      </div>
    )
  }

  render () {
    const { module: model } = this.props
    const { tableStyle = 'classic', showOptions = [] } = model.props
    const { fontSize, fontFamily, width } = model.props.style
    const style = {
      fontSize,
      fontFamily,
      width,
    }
    this.prepareRows()
    const tableStyleClass = styles[tableStyle]
    let showIcons = _.includes(showOptions, 'icons')
    let showStars = _.includes(showOptions, 'stars')
    let showBars = _.includes(showOptions, 'bars')
    let showValues = _.includes(showOptions, 'values')
    if (tableStyle === 'classic') {
      showIcons = true
      showStars = true
      showBars = false
      showValues = false
    }
    return (
      <div className={styles.table}>
        <div style={style} className={tableStyleClass}>
          {_.map(this.occupations, oc => (
            <div className={styles.row} key={oc.id}>
              {showIcons && <div className={styles.icon}><img src={oc.icon} /></div>}
              <div className={styles.name}>{I18nStore.tOccupation(oc, 'name')}</div>
              {showStars && this.renderStars(oc)}
              {showBars && this.renderBars(oc)}
              {showValues && this.renderValues(oc)}
            </div>
          ))}
        </div>
      </div>
    )
  }
}

export default CPIOccupations
