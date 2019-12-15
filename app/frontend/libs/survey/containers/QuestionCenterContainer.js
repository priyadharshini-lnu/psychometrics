import React, { Component } from 'react'
import 'styles/core.scss'
import QuestionCenter from 'layouts/QuestionCenter'
import PropertyPanel from 'views/PropertyPanel'
import UndoRedoDispatcher from 'dispatchers/UndoRedoDispatcher'
import Preview from 'components/Preview'
import RichEditor from 'components/RichEditor'
import PropertyPanelStore from 'store/PropertyPanelStore'
import AppStore from 'store/AppStore'
import Question from 'views/QuestionCenter/Question'
import homeStyles from 'views/Home/components/HomeView.scss'
import blockStyles from 'views/BlockList/components/BlockListView.scss'
import Randomization from 'components/Randomization'

class AppContainer extends Component {
  undoListener= null

  redoListener= null

  storeListener= null

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
      <QuestionCenter>
        <div className={homeStyles.survey}>
          <div className={blockStyles.main} style={{ background: '#fff', borderRight: '1px solid #ccc' }}>
            {AppStore.question && <Question model={AppStore.question} store={AppStore} />}
          </div>
        </div>
        <PropertyPanel restricted />
        <Preview />
        <RichEditor />
        <Randomization />
      </QuestionCenter>
    )
  }
}

export default AppContainer
