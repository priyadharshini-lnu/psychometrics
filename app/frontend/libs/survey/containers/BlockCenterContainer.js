import React, { Component } from 'react'
import 'styles/core.scss'
import BlockCenter from 'layouts/BlockCenter'
import PropertyPanel from 'views/PropertyPanel'
import UndoRedoDispatcher from 'dispatchers/UndoRedoDispatcher'
import Preview from 'components/Preview'
import Trash from 'views/Trash'
import RichEditor from 'components/RichEditor'
import PropertyPanelStore from 'store/PropertyPanelStore'
import AppStore from 'store/AppStore'
import Block from 'views/BlockCenter/Block'
import homeStyles from 'views/Home/components/HomeView.scss'
import blockStyles from 'views/BlockList/components/BlockListView.scss'
import Randomization from 'components/Randomization'

class BlockCenterContainer extends Component {
  undoListener = null

  redoListener = null

  storeListener = null

  componentDidMount () {
    this.undoListener = UndoRedoDispatcher.addListener('undo', this.update)
    this.redoListener = UndoRedoDispatcher.addListener('redo', this.update)
    this.storeListener = AppStore.addListener('change', () => this.forceUpdate())
  }

  componentWillUnmount () {
    this.undoListener.remove()
    this.redoListener.remove()
    this.storeListener.remove()
  }

  update = () => {
    this.forceUpdate()
    PropertyPanelStore.update()
  }

  render () {
    return (
      <BlockCenter>
        <div className={homeStyles.survey}>
          <div className={blockStyles.main} style={{ background: '#fff', borderRight: '1px solid #ccc' }}>
            {AppStore.block && <Block model={AppStore.block} store={AppStore} />}
          </div>
        </div>
        <Trash />
        <PropertyPanel restricted />
        <Preview />
        <RichEditor />
        <Randomization />
      </BlockCenter>
    )
  }
}

export default BlockCenterContainer
