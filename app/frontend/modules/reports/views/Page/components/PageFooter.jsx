import { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import PageModel from '~/modules/reports/models/Page'
import ScrollDispatcher from '~/modules/reports/dispatchers/ScrollDispatcher'
import styles from './Page.less'

class PageFooter extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  addPage = () => {
    const { report, model, addPage } = this.props
    const index = _.findIndex(report.builder.pages, p => p === model.id)
    const page = new PageModel({ position: model.position + 1 })
    addPage(page, index + 1)

    setTimeout(() => {
      ScrollDispatcher.scroll(page.id)
    }, 100)
  }

  render () {
    return (
      <div className={styles.footer}>
        <a onClick={this.addPage}>Add Page Here</a>
      </div>
    )
  }
}

export default PageFooter
