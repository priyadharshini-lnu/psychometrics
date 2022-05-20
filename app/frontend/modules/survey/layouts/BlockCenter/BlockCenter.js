import React, { Component } from 'react'
import 'styles/core.less'
import Modals from 'components/Modals'
import homeStyles from 'views/Home/components/HomeView.less'
import blockStyles from 'views/BlockList/components/BlockListView.less'
import Trash from 'views/Trash'
import Block from 'views/BlockCenter/Block'
import PropertyPanel from 'views/PropertyPanel'
import BlockSerializer from 'models/BlockSerializer'
import Header from './Header'
import styles from './BlockCenter.less'

export class BlockCenter extends Component {
  componentDidMount () {
    const { subscribeSocket, socketInitialized } = this.props
    if (!socketInitialized) {
      const urldata = location.pathname.match(/blocks\/(\d+)/)
      const id = urldata && urldata[1]
      subscribeSocket('Blocks::Channel', { block_id: id })
    }
  }

  disableClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  disableKey = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  overlay () {
    return (
      <div onKeyDown={this.disableKey} onClick={this.disableClick} className={styles.overlay}>
        <div className="message-box message-box-danger animated fadeIn open" id="message-box-danger">
          <div className="mb-container">
            <div className="mb-middle">
              <div className="mb-title">
                <span className="fa fa-times" />
                Attention!
              </div>
              <div className="mb-content">
                <p>Something went wrong</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  loading () {
    return (
      <div onKeyDown={this.disableKey} onClick={this.disableClick} className={styles.loading}>
        <i className={`fa fa-refresh fa-spin fa-fw ${styles.icon}`} />
        <span className={styles.loadingLabel}>Loading...</span>
      </div>
    )
  }

  render () {
    const { loaded, disabled, block } = this.props
    return (
      <div className="col-md-12">
        <div className="panel panel-default">
          <Header />
          <div className={`panel-body ${styles.mainContainer}`}>
            {!loaded && this.loading()}
            {disabled && this.overlay()}
            <div className={homeStyles.survey}>
              <div className={blockStyles.main} style={{ background: '#fff', borderRight: '1px solid #ccc' }}>
                {block && <Block model={BlockSerializer.wrap(block)} />}
              </div>
            </div>
            <PropertyPanel restricted />
            <Trash />
            <Modals />
          </div>
        </div>
        <div className="clearfix" />
      </div>
    )
  }
}

export default BlockCenter
