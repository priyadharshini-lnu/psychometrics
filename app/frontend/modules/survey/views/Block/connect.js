import { connect } from 'react-redux'
import { openModal } from '~/modules/admin/core/ui/modals'
import {
  createBlock, removeBlock, addQuestion, cloneBlock, renameBlock,
  saveAsTemplate, unlinkTemplate, updateBlockProps,
} from '~/modules/survey/core/builder/assessment/block/actions'
import { setFirstBlockContentOffset } from '~/modules/survey/core/temp/propertyPanel'
import { unselectQuestion, moveBlockDown, moveBlockUp } from '~/modules/survey/core/builder/assessment/actions'

export default connect(
  ({
    survey: {
      builder: {
        assessment,
      },
    },
  }) => ({
    currentLocale: assessment.locale,
    assessmentDefaultLanguage: assessment.defaultLanguage,
  }),
  {
    openRandomization: data => openModal('randomization', data),
    openSettings: data => openModal('blockSettings', data),
    openCreateByTemplate: data => openModal('createByTemplate', data),
    unselectQuestion,
    createBlock,
    removeBlock,
    addQuestion,
    moveBlockDown,
    moveBlockUp,
    cloneBlock,
    renameBlock,
    saveAsTemplate,
    unlinkTemplate,
    updateBlockProps,
    setFirstBlockContentOffset,
  },
)
