import DataSheet from './DataSheet'
import store from 'store/AssessmentPreviewStore'

export default class SubjectDataSheetResolver extends DataSheet {
  constructor(condition) {
    super(condition)
    this.datasheet = store.subjectDataSheet
  }
}
