import { DataType } from './subjectScoresRows'

const { I18n } = window

export const actionDetails = (action: string, subject: DataType) => {
  if (action === 'mark_finalized') {
    return {
      title: I18n.t('admin.scoring_subject_list_mark_finalized'),
      content: I18n.t('admin.scoring_subject_list_mark_finalized_confirm', { email: subject.email }),
    }
  } if (action === 'mark_not_finalized') {
    return {
      title: I18n.t('admin.scoring_subject_list_mark_not_finalized'),
      content: I18n.t('admin.scoring_subject_list_mark_not_finalized_confirm', { email: subject.email }),
    }
  }
  return {
    title: I18n.t('admin.scoring_subject_list_rescore'),
    content: I18n.t('admin.scoring_subject_list_rescore_confirm', { email: subject.email }),
  }
}

export const bulkActionDetails = (action: string) => {
  if (action === 'mark_finalized') {
    return {
      title: I18n.t('admin.scoring_subject_list_bulk_mark_finalized'),
      content: I18n.t('admin.scoring_subject_list_bulk_mark_finalized_confirm'),
    }
  } if (action === 'mark_not_finalized') {
    return {
      title: I18n.t('admin.scoring_subject_list_bulk_mark_not_finalized'),
      content: I18n.t('admin.scoring_subject_list_bulk_mark_not_finalized_confirm'),
    }
  }
  return {
    title: I18n.t('admin.scoring_subject_list_bulk_rescore'),
    content: I18n.t('admin.scoring_subject_list_bulk_rescore_confirm'),
  }
}
