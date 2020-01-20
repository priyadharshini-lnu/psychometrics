import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import Page from 'models/Page'
import AppStore from 'store/AppStore'
import LogicResolver from 'models/logic/LogicResolver'
import ConditionResolver from 'models/ConditionResolver'
import NormResolver from 'models/NormResolver'
import Flow from 'models/Flow'
import CountQuestionSize from 'commands/flow/CountQuestionSize'
import LocalStorage from '../utils/LocalStorage'

const { $ } = window

const FlowProcessor = function (store) {
  this.store = store
  this.fetchQuestions()
  this.flow = store.assessment.flow && store.assessment.flow.elements.length > 0
  this.current = 0
  this.step = 0
  this.pages = []
  if (this.flow) {
    this.initFlow(new Flow(_.cloneDeep(store.assessment.flow)))
  } else {
    this.initLinear(store)
  }
}

FlowProcessor.prototype = new EventEmitter()

_.extend(FlowProcessor.prototype, {
  fetchQuestions () {
    this.questions = _.flatten(this.store.assessment.blocks.map(block => block.questions))
    this.questions = _.reduce(this.questions, (arr, q) => {
      arr.push(q)
      return arr
    }, [])
  },

  initLinear (store) {
    const data = store.assessment
    _.map(data.blocks, (b) => {
      if (b.deleted) { return }
      let questions = []
      _.each(b.questions, (q) => {
        if (q.deleted) { return }
        if (q.type === 'PageBreak') {
          if (questions.length) {
            this.pages.push(new Page({ questions, block: b }, null, this.store.results))
          }
          questions = []
        } else if (q.display_logic) {
          let attrs
          if (questions.length > 0) {
            attrs = { questions, block: b, skipLogic: q.skip_logic }
            this.pages.push(new Page(attrs, null, this.store.results))
          }
          attrs = {
            questions: [q], block: b, skipLogic: q.skip_logic, displayLogic: q.display_logic,
          }
          this.pages.push(new Page(attrs, null, this.store.results))
          questions = []
        } else if (q.skip_logic && q.skip_logic.length) {
          questions.push(q)
          const attrs = {
            questions, block: b, skipLogic: q.skip_logic, displayLogic: q.display_logic,
          }
          this.pages.push(new Page(attrs, null, this.store.results))
          questions = []
        } else {
          questions.push(q)
        }
      })
      if (questions.length) {
        this.pages.push(new Page({ questions, block: b }, null, this.store.results))
      }
    })
    this.pages.push(new Page({ end: true }, null, this.store.results))
    _.times(this.store.dbResult.step, () => this.nextPage(false, true))
    if (!this.testDisplayLogic(this.currentPage())) {
      this.currentPage().skip = true
      this.nextPage(false, true)
    }
    this.update()
  },

  initFlow (flow) {
    flow.currentStep = 0
    const element = flow.elements[flow.currentStep]
    element.parent = flow
    this.nextElement = element
    flow.currentStep += 1
    this.flow = flow
    this.processNextStep()
    _.times(this.store.dbResult.step, () => this.nextPage(false))
    if (!this.testDisplayLogic(this.currentPage())) {
      this.currentPage().skip = true
      this.nextPage()
    }
  },

  restart () {
    this.current = 0
    this.end = false
    this.store.questions = []
    this.store.results = {}
    this.pages = []
    if (this.flow) {
      this.initFlow(new Flow(_.cloneDeep(this.store.assessment.flow)))
    } else {
      this.initLinear(this.store)
    }
    this.pages.map(page => page.resetAnswers())

    this.update()
  },

  currentPage () {
    return this.pages[this.current]
  },

  processNextStep () {
    if (this.nextElement && this.nextElement.type === 'Branch') {
      this.nextElement.currentStep = 0
    }
    this.processStep(this.nextElement)
  },

  processStep (element) {
    if (!element) {
      this.processEndOfAssessment()
      return
    }
    element.currentStep = typeof element.currentStep === 'undefined' ? 0 : element.currentStep
    if (element.type) {
      this[`process${element.type}`](element)
    } else {
      this.setNextStep(element)
      this.processNextStep()
    }
  },

  processSkipLogic (page) {
    if (page.skipLogic) {
      const conditions = _.map(page.skipLogic, (cond) => {
        cond.conditionType = 'Question'
        return [cond]
      })

      for (let i = 0; i < conditions.length; i += 1) {
        const resolver = new ConditionResolver(conditions[i])
        if (resolver.resolve()) {
          const followingQuestions = this.followingQuestions(page)
          // eslint-disable-next-line default-case
          switch (conditions[i][0].destination) {
            case 'EndOfBlock':
              this.deleteQuestions(followingQuestions)
              if (this.flow) {
                page.flowElement.current = this.current
              }
              this.processNextStep()
              return true
            case 'EndOfAssessment':
              if (this.flow) {
                const followingElements = this.followingElements(page.flowElement)
                this.deleteResults(followingElements)
              }
              this.deleteQuestions(followingQuestions)
              this.processEndOfAssessment()
              return true
            case 'SpecificBlock': {
              const blockId = +conditions[i][0].destinationBlock
              this.deleteQuestions(followingQuestions)
              this.skipTailPagesInBlock()
              const blocks = this.blocksToSkip(blockId)
              this.skipPagesForSkippedBlocks(blocks)
              return false
            }
          }
        }
      }
      return false
    }
  },

  blocksToSkip (blockId) {
    const { blocks } = this.store.assessment
    const destination = _.find(blocks, { id: blockId })
    const page = this.currentPage()
    const blocksToSkip = _.filter(blocks,
      ({ position }) => position > page.block.position && position < destination.position)
    return blocksToSkip
  },

  skipTailPagesInBlock () {
    const page = this.currentPage()
    const currentBlockPages = _.filter(this.pages, { block: page.block })
    const index = _.findIndex(currentBlockPages, page)
    const pagesToRemove = _.slice(currentBlockPages, index + 1)
    _.each(pagesToRemove, (page) => { page.skip = true })
  },

  skipPagesForSkippedBlocks (blocks) {
    const pages = _.filter(this.pages, page => _.includes(blocks, page.block))
    _.each(pages, (page) => { page.skip = true })
  },

  testDisplayLogic (page) {
    if (page.displayLogic) {
      const resolver = new LogicResolver(page.displayLogic)
      return resolver.resolve()
    }

    return true
  },

  nextPage (sync = true, skipValidations = false) {
    if (!this.store.ignoreValidation && !skipValidations) {
      const page = this.currentPage()
      page.results().map((result) => {
        this.store.results[result.question.id] = result
      })
      this.store.questions = _.union(this.store.questions, page.questions)
      page.validate()
      if (page.errors.length) {
        this.update()
        return
      }
      if (this.processSkipLogic(page)) {
        if (sync) {
          this.pushResults()
        }
        this.update()
        return
      }
    }

    this.setNextPage()

    const nextPage = this.currentPage()
    if (!this.testDisplayLogic(nextPage) || nextPage.questions.length === 0) {
      this.deleteQuestions(nextPage.questions)
      if (!this.isEnd()) {
        nextPage.skip = true
        return this.nextPage(sync, true)
      }
    }

    if (nextPage.skip) {
      this.nextPage(false)
      return
    }

    if (sync) {
      this.pushResults()
    }
    this.update()
  },

  setNextPage () {
    const max = this.pages.length - 1
    if (this.current < max) {
      this.current += 1
      this.step += 1
    } else {
      this.current = max
      if (this.flow) {
        this.processNextStep()
      } else {
        this.end = true
        LocalStorage.remove([location.pathname])
      }
    }
  },

  prepareStatus () {
    if (this.store.isThreesixty && this.store.dbResult.status === 'completed') {
      return 'completed'
    }

    return this.isEnd() ? 'completed' : 'in_progress'
  },

  pushResults () {
    const data = {
      resource: {
        [this.store.isThreesixty ? 'answers' : 'results']: this.store.results,
        step: this.step,
        embedded_data: this.store.embeddedData,
        status: this.prepareStatus(),
      },
    }
    const url = this.store.isThreesixty ? this.store.resultsUrl : `/assigns/${this.store.dbResult.id}`
    if (this.store.type === 'pass_assessment') {
      if (this.isEnd()) {
        const normData = this.mapNorms()
        if (this.store.isThreesixty) {
          Object.assign(data.resource, { norm_id: normData.id })
        } else {
          Object.assign(data.resource, { norm_data: normData })
        }
      }
      $.ajax({
        method: 'PUT',
        url,
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(data),
        error () {
          AppStore.disable()
        },
      })
    }
  },

  mapNorms () {
    const resolver = new NormResolver(this.store.assessment.norm_rules, this.store.dbResult)
    return resolver.resolve()
  },

  isEnd () {
    if (this.flow) {
      return this.end
    }
    return this.pages.length - 1 === this.current
  },

  countAllQuestions () {
    if (!this.flow) { return this.store.getAllAnsweringQuestions().length }
    let { elements } = this.flow

    elements = _.flatMap(elements, e => this.processValidBranches(e))
    elements.forEach((e, i) => e.recalcPath(this.flow, i))
    const result = CountQuestionSize.call(elements, this.currentPage().flowElement)
    return result[0] + this.store.getRealResults().length
  },

  // Simplify Flow by already stored results (remove whole branch or flat inner elements)
  processValidBranches (element) {
    if (element.type === 'Branch') {
      const resolver = new ConditionResolver(element.props.conditions)
      if (!resolver.isFilled()) { return element }
      if (resolver.resolve()) {
        return _.flatMap(element.elements, e => this.processValidBranches(e))
      }
      return []
    }
    return element
  },

  getProgress () {
    const countAnsweredQuestions = this.currentPage().countAnsweredQuestions() + this.store.getRealResults().length
    return parseInt(countAnsweredQuestions * 100 / this.countAllQuestions(), 10)
  },

  processBranch (element) {
    let invalidElements = []
    const resolver = new ConditionResolver(element.props.conditions)
    if (resolver.resolve()) {
      // FYI: When we process new branch we lookup all following elements and
      // remove all results for these elements. Perfect =)

      invalidElements = this.followingElements(element)
      this.setNextStep(element, true)
    } else {
      // FYI: when we go back and change result for a question which takes part in condition
      //  flow element, we should remove all results by flow
      //  element, if condition is not valid.
      //  But if we use same blocks in different flow elements, when
      //  we catch not valid condition, we clear results for all questions.
      //  Good example: Thriving Index Assessment

      invalidElements = [element]
      this.setNextParent(element)
    }

    // TODO (atanych): We need to sort out code below
    this.deleteResults(invalidElements)

    this.processNextStep()
  },

  getQuestionsFromPreviousPages () {
    if (this.current === 0) { return [] }
    const pages = _.take(this.pages, this.current)
    return _.flatMap(pages, p => p.questions)
  },

  deleteResults (elements) {
    if (this.store.assessment.enable_back) {
      const blocks = this.elementsBlocks(elements)
      const questions = this.blocksQuestions(blocks)
      this.deleteQuestions(questions)
    }
  },

  deleteQuestions (questions) {
    const questionIds = _.map(questions, question => Number(question.id))
    const filteredResults = _.omitBy(this.store.results, (value, key) => _.includes(questionIds, Number(key)))
    this.store.results = filteredResults
  },

  elementsBlocks (elements) {
    return _.flatten(
      _.reduce(elements, (results, element) => {
        if (element.type === 'Block') {
          results.push(element)
        }

        if (element.type === 'Branch') {
          results.push(this.elementsBlocks(element.elements))
        }

        return results
      }, []),
    )
  },

  blocksQuestions (blocks) {
    return _.flatten(
      _.reduce(blocks, (results, block) => {
        const id = Number(block.props.current)
        const assessmentBlocks = this.store.assessment.blocks
        const { questions } = _.find(assessmentBlocks, { id })
        results.push(questions)

        return results
      }, []),
    )
  },

  followingElements (element) {
    const { elements } = element.parent
    const sliceIndex = elements.indexOf(element) + 1

    return elements.slice(sliceIndex)
  },

  followingQuestions (page) {
    const { questions } = page.block
    const question = page.questions[page.questions.length - 1]

    return _.filter(questions, q => q.position > question.position)
  },

  lookupParent (element) {
    if (!element) { return null }
    const { parent } = element
    if (parent && parent.elements[parent.currentStep]) { return parent }

    return this.lookupParent(element.parent)
  },

  setNextParent (element) {
    const parent = this.lookupParent(element)
    if (parent && parent.elements[parent.currentStep]) {
      const prev = this.nextElement
      this.nextElement = parent.elements[parent.currentStep]
      this.nextElement.parent = parent
      this.nextElement.prev = prev
      parent.currentStep += 1
    } else {
      this.nextElement = null
    }
  },

  setNextStep (element, dive) {
    const parent = dive ? element : element.parent
    this.prevElement = element.prev

    if (element.elements[element.currentStep]) {
      const prev = this.nextElement
      this.nextElement = element.elements[element.currentStep]
      this.nextElement.parent = parent
      this.nextElement.prev = prev
      element.currentStep += 1
    } else {
      this.setNextParent(element)
    }
    this.step += 1
  },

  processBlock (element) {
    this.pages = this.blockPages(element)
    this.current = 0
    this.setNextStep(element)
    this.update()
  },

  blockPages (element) {
    const data = this.store.assessment
    const id = element.props.current
    const block = _.find(data.blocks, { id: +id })
    let questions = []
    const pages = []
    _.each(block.questions, (q) => {
      if (q.deleted) { return }
      if (q.type === 'PageBreak') {
        pages.push(new Page({ questions, block }, element, this.store.results))
        questions = []
      } else if (q.display_logic || (q.skip_logic && q.skip_logic.length)) {
        questions.push(q)
        const attrs = {
          questions, block, skipLogic: q.skip_logic, displayLogic: q.display_logic,
        }
        pages.push(new Page(attrs, element, this.store.results))
        questions = []
      } else {
        questions.push(q)
      }
    })
    if (questions.length) {
      pages.push(new Page({ questions, block }, element, this.store.results))
    }

    return pages
  },

  processEndOfAssessment (element) {
    this.current = this.pages.length - 1
    this.pages.push(new Page({ end: true }, element, this.store.results))
    this.end = true
    this.setNextPage()
    this.update()
    LocalStorage.remove([this.store.resultLocalStorageKey])
  },

  processEmbeddedData (element) {
    const { store } = this
    element.props.storage.map((data) => {
      if (data.key) {
        store.embeddedData[data.key] = data.value
      }
    })
    this.setNextStep(element)
    this.processNextStep()
  },

  processRandomizer (element) {
    element.elements = _.sampleSize(element.elements, element.props.number)
    element.elements = _.flatMap(element.elements, e => this.processValidBranches(e))
    // We should recalculate path for each inner element
    element.elements.forEach((e, i) => e.recalcPath(this.flow, i))
    this.setNextStep(element, true)
    this.processNextStep()
  },

  processUniqueGenerator (element) {
    this.setNextStep(element)
    this.processNextStep()
  },

  canBack () {
    return this.current >= 1
  },

  prevPage () {
    if (this.isFirstPage()) {
      if (!this.testDisplayLogic(this.currentPage())) {
        this.nextPage(false, true)
      }
      return
    }

    if (this.current === 0 && this.flow) {
      this.setPrevStep()
      this.processPrevStep()
    } else if (this.current > 0) {
      this.current -= 1
    }

    if (!this.testDisplayLogic(this.currentPage())) {
      this.prevPage()
    }
    const prevPage = this.currentPage()

    if (prevPage.skip) {
      if (this.isFirstPage()) {
        if (!this.testDisplayLogic(this.currentPage())) {
          this.nextPage()
        }
      } else {
        this.prevPage()
      }
      prevPage.skip = false
      return
    }
    this.step -= 1
    this.update()
  },

  isFirstPage () {
    return this.current === 0 && !this.prevElement
  },

  update () {
    this.emit('change')
    this.store.update()
  },

  processPrevStep () {
    const element = this.nextElement.prev
    if (element && element.type) {
      this[`processPrev${element.type}`](element)
    }
  },

  processPrevBlock (element) {
    this.pages = this.blockPages(element)
    if (typeof element.current !== 'undefined') {
      this.current = element.current
      delete element.current
    } else {
      this.current = this.pages.length - 1
    }
    this.update()
  },

  processPrevBranch (element) {
    this.setPrevParent(element.parent)
    this.processPrevStep()
  },

  setPrevStep () {
    const element = this.prevElement
    element.currentStep = typeof element.currentStep === 'undefined' ? 0 : element.currentStep

    if (element.currentStep) {
      this.setPrevParent(element)
    } else {
      this.setPrevParent(element.parent)
    }
  },

  setPrevParent (parent) {
    const decrement = this.decrementForCurrentStep(parent)
    parent.currentStep -= decrement
    const currentElement = this.currentElement(parent)

    if (currentElement) {
      this.prevElement = this.prevElement.prev
      this.nextElement = currentElement
      this.nextElement.parent = parent
    }
  },

  currentElement (parent) {
    if (!parent.currentStep) {
      return null
    }

    return parent.elements[parent.currentStep - 1]
  },

  decrementForCurrentStep () {
    const stepOutFromBranch = this.nextElement && this.nextElement.prev.type === 'Branch'
      && this.nextElement.parent === this.nextElement.prev

    if (!this.nextElement || !this.prevElement || stepOutFromBranch) {
      return 0
    }

    return 1
  },
})

export default FlowProcessor
