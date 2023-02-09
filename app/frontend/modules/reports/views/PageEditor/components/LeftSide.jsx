import { Component } from 'react'
import { DropTarget } from 'react-dnd'
import _ from 'lodash'
import throttle from 'lodash/throttle'
import { Divider } from 'antd'
import PageModel from '~/modules/reports/models/Page'
import store from '~/modules/reports/store/PageList'
import PageLabel from './PageLabel'
import styles from './PageEditor.less'
import { ModuleList } from './ModuleList'

const fieldTarget = {
  drop () {
  },
}

class PageEditor extends Component {
  state = {
    modulesOpen: false,
    page: null,
  }

  storeListener = null

  movePage = throttle((id, atIndex) => {
    const { updatePagePositions } = this.props
    // const { page, index } = this.findPage(id)
    updatePagePositions(id, atIndex)
  }, 200)

  componentDidMount () {
    this.storeListener = store.addListener('change', this.update)
  }

  update = () => {
    this.forceUpdate()
  }

  change = () => {
    this.forceUpdate()
    store.update()
  }


  findPage = (id) => {
    const { pages } = this.props
    const page = _.find(pages, { id })

    return {
      page,
      index: pages.indexOf(page),
    }
  }

  click = (page) => {
    const { unselectModules, selectModule } = this.props
    unselectModules()
    selectModule('Page', page)
  }

  componentWillUnmoun () {
    this.storeListener.remove()
  }

  render () {
    const { report: { currentPage }, pages, connectDropTarget } = this.props
    const { page: pageData, modulesOpen } = this.state

    return connectDropTarget(
      <div className={styles.leftMain}>
        <div className={styles.leftSide}>
          {_.map(pages, (data, i) => {
            const page = new PageModel(data, [])
            if (page.removed) { return false }
            page.renderModules = _.includes([(currentPage - 1), currentPage, (currentPage + 1)], i)
            return (
              <PageLabel
                key={page.id}
                movePage={this.movePage}
                findPage={this.findPage}
                page={page}
                number={i + 1}
                active={currentPage === page.id ? styles.active : ''}
                onChange={this.change}
                onClick={() => this.click(page)}
                onOpenModules={() => this.setState({ modulesOpen: true, page: data })}
              />
            )
          })}
        </div>
        {modulesOpen && (
          <div className={styles.cover} onClick={() => this.setState({ modulesOpen: false })}>
            <div className={styles.modules}>
              <div className={styles.caption}>
                {pageData.name}
                {` #${pageData.position} `}
                Modules
              </div>
              <Divider style={{ margin: 0 }} />
              <ModuleList page={pageData} />
            </div>
          </div>
        )}
      </div>,
    )
  }
}

export default DropTarget('Page', fieldTarget, connect => ({
  connectDropTarget: connect.dropTarget(),
}))(PageEditor)
