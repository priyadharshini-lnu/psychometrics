import _ from 'lodash'

export const END = 'END'

const CountQuestionSize = {
  call (elements, currentElement) {
    // (1) Simplify flow elements
    //   >> [4, [2, [4, "END"], [3, [4, "END"], 1, "END"], 1], ["END"], 3]
    let simplifiedFlowData = elements.map(element => element.reduceQuestions())

    simplifiedFlowData = this.simplifyByCurrentElement(currentElement, simplifiedFlowData)

    const allWaysByEnd = this.countAllWaysByEnd(simplifiedFlowData)

    // In this case we might calculate sum of this array by _.flatMapDeep and _.sum
    const maxQuestionSizeWithoutEnd = _.sum(_.flatMapDeep(simplifiedFlowData))
    return _.max(allWaysByEnd) > maxQuestionSizeWithoutEnd ? [_.max(allWaysByEnd), END] : [maxQuestionSizeWithoutEnd]
  },

  // Return the array of max remaining questions of all possible ways which are stopped by EndOfAssessment
  countAllWaysByEnd (simplifiedFlowData) {
    // (3) Lookup paths for all EndOfAssessments
    // endData looks like:
    //   >> [10, 13, 10, 7]
    //   >> [{"path":[1, 1, 1]},{"path":[1, 2, 1, 1]}, ...]
    const endData = this.lookupEnd(simplifiedFlowData, [], [])

    // (4) _.set mutated simplifiedFlowData, in particular removed all inner arrays with END
    // On this step simplifiedFlowData looks like:
    //    >> [4, [2, [], [], 1], [], 3]
    return endData.map((f) => {
      const flattenData = _.flatMapDeep(simplifiedFlowData)
      let sum = 0
      for (let i = 0; i < flattenData.length; i += 1) {
        if (flattenData[i] === END) {
          if (f.path.length > 1) {
            _.set(simplifiedFlowData, _.dropRight(f.path), [])
          } else {
            simplifiedFlowData.splice(f.path)
          }
          break
        }
        sum += flattenData[i]
      }
      return sum
    })
  },

  // Simplify (cut) the flow data by current position
  simplifyByCurrentElement (currentElement, simplifiedFlowData) {
    if (!currentElement) { return simplifiedFlowData }
    if (currentElement) {
      const currentPath = currentElement.path
      // If we are on element that has sibling EndOfAssessment we should recalculate
      // question size only for current parent
      // if (currentElement.parent.elements.find(e => e.type === 'EndOfAssessment')) {
      //   return this.call(currentElement.parent.elements.slice(_.last(currentPath)))
      // }
      // Then we should remove already passed elements
      //   Example:
      //   if currentElement.path = [1, 0]
      //   simplifiedFlowData will be:
      //   >> [[2, [4, "END"], [3, [4, "END"], 1, "END"], 1], ["END"], 3]
      for (let i = currentPath.length - 1; i >= 0; i -= 1) {
        const innerPath = _.take(currentPath, i)
        const tail = currentPath[i]
        if (innerPath.length) {
          _.set(simplifiedFlowData, innerPath, _.get(simplifiedFlowData, innerPath).slice(tail))
        } else {
          simplifiedFlowData = simplifiedFlowData.slice(tail)
        }
      }
    }
    return simplifiedFlowData
  },

  // Lookup all elements with type EndOfAssessment and store paths
  lookupEnd (res, path = [], result) {
    for (let i = 0; i < res.length; i += 1) {
      const el = res[i]
      if (el === END) {
        result.push({ path: path.concat(i) })
      }

      if (!Array.isArray(el)) {
        // eslint-disable-next-line no-continue
        continue
      }
      this.lookupEnd(el, path.concat(i), result)
    }
    return result
  },
}

export default CountQuestionSize
