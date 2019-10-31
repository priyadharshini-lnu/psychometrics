import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import AppStore from 'store/AppStore'
import LogicElement from 'models/logic/LogicElement'

class DisplayLogicStore extends EventEmitter {
  constructor () {
    super()
    this.question = null
    this.flowElement = null
  }

  open (question) {
    AppStore.fetchQuestions()
    this.question = question
    this.logicElement = _.cloneDeep(question.displayLogic) || new LogicElement()
    this.update()
  }

  close () {
    this.question = null
    this.logicElement = null
    this.callback = null
    this.update()
  }

  save () {
    this.question.displayLogic = this.logicElement
    this.question.update()
    this.update()
  }

  remove (question) {
    question.clearDisplayLogic()
    question.update()
    this.update()
  }

  update () {
    this.emit('change')
  }
}

export default new DisplayLogicStore()
