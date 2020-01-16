import React, { Component } from 'react'
import store from 'rb/store/PreviewStore'
import PageList from 'rb/store/PageList'
import LogicResolver from 'rb/models/logic/LogicResolver'
import Page from './Page'

export class Preview extends Component {
  storeListener = null

  componentDidMount () {
    this.storeListener = store.addListener('change', () => this.forceUpdate())
  }

  componentWillUnmount () {
    this.storeListener.remove()
  }

  render () {
    const { localeDirection } = this.props
    return (
      <div style={{ position: 'relative' }} className={localeDirection}>
        {PageList.list.map((page, i) => {
          if (!(LogicResolver.run(page.displayLogic))) { return null }
          return <Page model={page} key={i} />
        })}
      </div>
    )
  }
}

export default Preview
