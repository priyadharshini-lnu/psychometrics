import { isSuperAdmin, hasGrant } from 'core/currentUser'
import IAssessment from '../interfaces/Assessment'
import User from '../interfaces/User'

const isExternal = category => ['hogan', 'mindmill'].includes(category)
const isInternal = category => !isExternal(category)

const Assessment = {
  exportRawResults: (currentUser: User, record: IAssessment) => {
    if (isExternal(record.category)) return false
    if (isSuperAdmin(currentUser)) return true
    return hasGrant(currentUser, 'assessments', 'export')
  },
  exportScoringResults: (
    currentUser: User,
    record: IAssessment,
  ) => Assessment.exportRawResults(currentUser, record),
  exportNormedResults: (currentUser: User, record: IAssessment) => {
    if (isExternal(record.category)) return false
    if (isSuperAdmin(currentUser)) return true

    return hasGrant(currentUser, 'assigns', 'view')
  },
  exportExternalResults: (currentUser: User, record: IAssessment) => {
    if (isInternal(record.category)) return false
    if (isSuperAdmin(currentUser)) return true

    return hasGrant(currentUser, 'assigns', 'view')
  },
  importResults: (currentUser: User, record: IAssessment) => {
    if (isExternal(record.category)) return false
    if (isSuperAdmin(currentUser)) return true

    return hasGrant(currentUser, 'assessments', 'import')
  },
}

export default Assessment
