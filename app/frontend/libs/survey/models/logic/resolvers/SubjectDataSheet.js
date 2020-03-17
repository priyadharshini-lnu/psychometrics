import store from 'store/AssessmentPreviewStore'
import DataSheet from './DataSheet'

export default class SubjectDataSheetResolver extends DataSheet {
  constructor (condition) {
    super(condition)
    this.datasheet = store.subjectDataSheet
  }
}
