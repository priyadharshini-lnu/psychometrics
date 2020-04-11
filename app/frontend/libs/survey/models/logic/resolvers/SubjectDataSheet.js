import DataSheet from './DataSheet'

export default class SubjectDataSheetResolver extends DataSheet {
  constructor (condition, context) {
    super(condition, context)
    this.datasheet = context.subjectDataSheet
  }
}
