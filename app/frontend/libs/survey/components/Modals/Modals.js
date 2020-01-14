import React from 'react'
import Randomization from '../Randomization'
import CustomValidation from '../CustomValidation'
import DefaultValue from '../DefaultValue'
import DisplayLogic from '../DisplayLogic'
import Preview from '../Preview'
import PipedText from '../PipedTextModal'
import RichEditor from '../RichEditor'
import Flow from '../Flow'
import CreateByTemplate from '../CreateByTemplate'
import MappingNorms from '../MappingNorms'

const MODALS = {
  displayLogic: DisplayLogic,
  defaultValue: DefaultValue,
  randomization: Randomization,
  preview: Preview,
  pipedText: PipedText,
  richEditor: RichEditor,
  flow: Flow,
  customValidation: CustomValidation,
  createByTemplate: CreateByTemplate,
  mapNorms: MappingNorms,
}


export default function Modals ({ current }) {
  if (!_.size(current)) return null

  return (
    <>
      {_.map(current, (modal, key) => {
        const ModalComponent = MODALS[key]
        return <ModalComponent key={key} {...modal} />
      })}
    </>
  )
}
