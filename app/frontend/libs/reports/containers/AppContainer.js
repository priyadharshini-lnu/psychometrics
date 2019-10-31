/* eslint-disable react/no-find-dom-node */
import React, { Component } from 'react'
import Dashboard from 'rb/views/layouts/Dashboard'
import PageEditor from 'rb/views/PageEditor'
import I18nStore from 'rb/store/I18nStore'
import UndoRedoDispatcher from 'rb/dispatchers/UndoRedoDispatcher'
import Prompt from 'rb/components/Prompt'
import FilterModal from 'rb/components/modals/FilterModal'
import DataSheetModal from 'rb/components/modals/DataSheetModal'
import AliasModal from 'rb/components/modals/AliasModal'
import SavePopUp from 'rb/components/modals/AliasModal/components/SavePopUp'
import DataConfigurationModal from 'rb/components/modals/DataConfigurationModal'
import CPIFactorConditionModal from 'rb/components/modals/CPIFactorConditionModal'
import InnovationStyleConditionModal from 'rb/components/modals/InnovationStyleConditionModal'
import ConditionalFactorOccupationTextModal from 'rb/components/modals/ConditionalFactorOccupationTextModal'
import ConditionalTextModal from 'rb/components/modals/ConditionalTextModal'
import ConditionalImageModal from 'rb/components/modals/ConditionalImageModal'
import DisplayLogic from 'rb/components/modals/DisplayLogic'
import PipedTextModal from 'rb/components/modals/PipedTextModal'
import Socket from 'rb/cable'
import Library from 'psychometrics-library-ui'
import HTML5Backend from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'
import ReactDOM from 'react-dom'
import ResultStore from 'rb/store/ResultStore'
import Result from 'rb/models/Result'

class AppContainer extends Component {
  undoListener = null

  redoListener = null

  componentDidMount () {
    const parent = ReactDOM.findDOMNode(this).parentNode
    const assessmentIds = JSON.parse(parent.dataset.assessmentIds)
    _.each(assessmentIds, (id) => {
      ResultStore.results[id] = new Result(id)
    })
    Socket.setProvider('Report')
    I18nStore.setLocale(document.body.dataset.locale)
    this.undoListener = UndoRedoDispatcher.addListener('undo', this.update)
    this.redoListener = UndoRedoDispatcher.addListener('redo', this.update)
  }

  componentWillUnmount () {
    this.undoListener.remove()
    this.redoListener.remove()
  }

  update = () => {
    this.forceUpdate()
  }

  render () {
    return (
      <div className="row">
        <DndProvider backend={HTML5Backend}>
          <Dashboard>
            <PageEditor />
            <Prompt />
            <FilterModal />
            <DataSheetModal />
            <AliasModal />
            <DataConfigurationModal />
            <SavePopUp />
            <ConditionalTextModal />
            <ConditionalImageModal />
            <CPIFactorConditionModal />
            <ConditionalFactorOccupationTextModal />
            <InnovationStyleConditionModal />
            <Library />
            <DisplayLogic />
            <PipedTextModal />
          </Dashboard>
        </DndProvider>
      </div>
    )
  }
}

export default AppContainer
