import React, { Component } from 'react'
import store from 'modules/reports/store/PageList'
import { DropTarget } from 'react-dnd'
import PageModel from 'modules/reports/models/Page'
import throttle from 'lodash/throttle'
import PageLabel from './PageLabel'
import styles from './PageEditor.scss'

const fieldTarget = {
  drop () {
  },
}

class PageEditor extends Component {
  componentDidMount () {
    this.storeListener = store.addListener('change', this.update)
  }

  storeListener = null

  movePage = throttle((id, atIndex) => {
    const { updatePagePositions } = this.props
    // const { page, index } = this.findPage(id)
    updatePagePositions(id, atIndex)
  }, 200)

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
    return connectDropTarget(
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
            />
          )
        })}
      </div>,
    )
  }
}

export default DropTarget('Page', fieldTarget, connect => ({
  connectDropTarget: connect.dropTarget(),
}))(PageEditor)
