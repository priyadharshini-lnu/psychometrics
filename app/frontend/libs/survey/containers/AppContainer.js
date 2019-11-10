import React, { Component } from 'react'
import 'styles/core.scss'
import Home from 'views/Home'
import Trash from 'views/Trash'
import PropertyPanel from 'views/PropertyPanel'
import UndoRedoDispatcher from 'dispatchers/UndoRedoDispatcher'
import Preview from 'components/Preview'
import RichEditor from 'components/RichEditor'
import Randomization from 'components/Randomization'
import DefaultValue from 'components/DefaultValue'
import DisplayLogic from 'components/DisplayLogic'
import CustomValidation from 'components/CustomValidation'
import CreateByTemplate from 'components/CreateByTemplate'
import EndOfAssessmentModal from 'components/EndOfAssessmentModal'
import Flow from 'views/Flow'
import MappingNorms from 'views/MappingNorms'
import PropertyPanelStore from 'store/PropertyPanelStore'
import AppStore from 'store/AppStore'
import I18nStore from 'store/I18nStore'
import Library from 'libs/library'
import PipedTextModal from 'components/PipedTextModal'
import Scoring from '../layouts/Scoring'
import Dashboard from '../layouts/Dashboard'

class AppContainer extends Component {
  undoListener = null

  redoListener = null

  storeListener = null

  componentDidMount () {
    this.undoListener = UndoRedoDispatcher.addListener('undo', this.update)
    this.redoListener = UndoRedoDispatcher.addListener('redo', this.update)
    this.storeListener = AppStore.addListener('change', () => this.forceUpdate())
    I18nStore.setLocale(document.body.dataset.locale)
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

  renderScoring () {
    return (
      <Scoring />
    )
  }

  renderAssessment () {
    return (
      <Dashboard>
        <Home />
        <PropertyPanel />
        <Trash />
        <Preview />
        <RichEditor />
        <Randomization />
        <CustomValidation />
        <DefaultValue />
        <DisplayLogic />
        <CreateByTemplate />
        <Flow />
        <MappingNorms />
        <EndOfAssessmentModal />
        <Library />
        <PipedTextModal />
      </Dashboard>
    )
  }

  render () {
    return (
      <div className="row">
        {AppStore.scoring ? this.renderScoring() : this.renderAssessment()}
      </div>
    )
  }
}

export default AppContainer
