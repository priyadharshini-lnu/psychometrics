/* eslint-disable no-unused-vars */
import _ from 'lodash'
import store, { NOT_ANSWERED_QUESTIONS } from 'store/AssessmentPreviewStore'
import CountQuestionSize, { END } from 'commands/flow/CountQuestionSize'
import { EventEmitter } from 'fbemitter'
import FlowCondition from './FlowCondition'

const FlowElement = function (attrs = {}, parent, index = 0) {
  this.type = attrs.type
  this.parent = parent
  this.props = attrs.props || {}
  this.path = parent && parent.path ? parent.path.concat(index) : [index]
  if (this.props.conditions && this.props.conditions.length) {
    this.props.conditions = _.map(this.props.conditions, condition => new FlowCondition(condition))
  }
  this.elements = this.loadElements(attrs.elements)
}

FlowElement.prototype = new EventEmitter()

_.extend(FlowElement.prototype, {

  recalcPath (parent, index) {
    this.path = parent && parent.path ? parent.path.concat(index) : [index]
    this.elements.map((e, i) => e.recalcPath(this, i))
  },

  newElement () {
    this.elements.push(new FlowElement({}, this))
  },

  addElementBelow () {
    const index = _.findIndex(this.parent.elements, el => this === el)
    this.parent.elements.splice(index + 1, 0, new FlowElement({}, this.parent))
  },

  duplicateElement () {
    const index = _.findIndex(this.parent.elements, el => this === el)
    const duplicate = new FlowElement(_.cloneDeep(this), this.parent)
    this.parent.elements.splice(index + 1, 0, duplicate)
  },

  remove (el) {
    if (el) {
      _.pull(this.elements, el)
    } else {
      this.parent.remove(this)
    }
  },

  loadElements (elements) {
    return _.map(elements, (element, index) => new FlowElement(element, this, index))
  },

  reduceQuestions () {
    if (this.type === 'Block') { return this.countQuestions() }
    if (this.type === 'EndOfAssessment') { return END }

    if (this.type === 'Randomizer' && !this.isInsideElement()) {
      const sizes = this.elements.map(element => (element.elements.length
        ? CountQuestionSize.call([element])
        : [element.countQuestions()]))
      return [this.lookupMaxWithEnd(sizes), this.lookupMaxWithoutEnd(sizes)]
    }
    if (!this.elements.length) { return this.countQuestions() }
    return _.map(this.elements, element => element.reduceQuestions())
  },

  // Useful for Randomizer
  lookupMaxWithoutEnd (sizes) {
    const sizesWithoutEnd = sizes.filter(([size, isEnd]) => isEnd !== END)
    // Check, if any size does not contain END, we sort and cal sum for all
    // Check, if length of sizes without end not less than this.props.number, we also sort and cal sum for all
    if (sizesWithoutEnd.length === sizes.length || sizesWithoutEnd.length >= this.props.number) {
      return _.sumBy(_.take(_.sortBy(sizesWithoutEnd, e => -e[0]), this.props.number), e => e[0])
    }
    // If length of sizes without end less than this.props.number, we return 0
    if (sizesWithoutEnd.length < this.props.number) { return 0 }
  },

  lookupMaxWithEnd (sizes) {
    const sizesWithEnd = sizes.filter(([size, isEnd]) => isEnd === END)
    if (!sizesWithEnd.length) { return 0 }
    return [_.sumBy(_.take(_.sortBy(sizes, e => -e[0]), this.props.number), e => e[0]), END]
  },

  isInsideElement () {
    return _.isEqual(_.take(store.flow.currentPage().flowElement.path, this.path.length), this.path)
  },

  countQuestions () {
    if (this.type === 'Block') {
      const { questions } = store.assessment.blocks.find(block => block.id === parseInt(this.props.current, 10))
      let passedQuestions = []
      // We should consider PageBreak to count questions
      if (store.flow.currentPage() && store.flow.currentPage().block.id === parseInt(this.props.current, 10)) {
        passedQuestions = store.flow.getQuestionsFromPreviousPages()
          .filter(q => !NOT_ANSWERED_QUESTIONS.includes(q.type))
      }
      return questions.filter(q => !NOT_ANSWERED_QUESTIONS.includes(q.type)).length - passedQuestions.length
    }
    return 0
  },

  toJSON () {
    return {
      type: this.type,
      elements: this.elements,
      path: this.path,
      props: this.props,
    }
  },
})

export default FlowElement
