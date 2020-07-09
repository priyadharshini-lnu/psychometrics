import React from 'react'
import _ from 'lodash'

interface Props {
  modals: { [name: string]: React.FC<PassedModalProps> }
  current: string[]
  data: { [name: string]: object }
  closeModal(name: string): void
}

interface PassedModalProps {
  close(): void
}

const Modals: React.FC<Props> = ({
  modals, current, data, closeModal,
}) => {
  if (!_.size(current)) return null
  return (
    <>
      {_.map(current, (modalName: string) => {
        const ModalComponent = modals[modalName]
        const modalProps = data[modalName] || {}
        return <ModalComponent key={modalName} close={() => closeModal(modalName)} {...modalProps} />
      })}
    </>
  )
}

export default Modals
