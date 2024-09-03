export default class UserTypeResolver {
  constructor (public condition: {
    prefix?: string
    field?: string
    predicate?: string
    value?: string
  }, public context) {}

  resolve () {
    return this[this.condition.predicate as string]()
  }

  is () {
    if (this.condition.value === 'Anonymous') {
      return this.context.isAnonymousAssessment
    }

    if (this.condition.value === 'Registered') {
      return !this.context.isAnonymousAssessment
    }
  }

  isNot () {
    if (this.condition.value === 'Anonymous') {
      return !this.context.isAnonymousAssessment
    }

    if (this.condition.value === 'Registered') {
      return this.context.isAnonymousAssessment
    }
  }
}
