import React, { Component } from 'react'
import store from 'rb/store/PageList'
import { DropTarget } from 'react-dnd'
import PageModel from 'rb/models/Page'
import PageLabel from './PageLabel'
import styles from './PageEditor.scss'

const fieldTarget = {
  drop () {
  },
}

class PageEditor extends Component {
  storeListener = null

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

  movePage = (id, atIndex) => {
    const { updatePagePositions } = this.props
    // const { page, index } = this.findPage(id)

    updatePagePositions(id, atIndex)
  }

  findPage = (id) => {
    const { pages } = this.props
    const page = _.find(pages, { id })

    return {
      page,
      index: pages.indexOf(page),
    }
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
