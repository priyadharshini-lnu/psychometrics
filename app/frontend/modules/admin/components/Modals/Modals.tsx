import React from 'react'
import _ from 'lodash'
import { PropsFromRedux } from './connect'

interface OwnProps {
  modals: { [name: string]: React.FC<PassedModalProps> }
}
type Props = OwnProps & PropsFromRedux

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
        if (ModalComponent === undefined) {
          console.error(`Modal ${modalName} not present in modals props. Modals are ${Object.keys(modals)}`)
          return null
        }
        return <ModalComponent key={modalName} close={() => closeModal(modalName)} {...modalProps} />
      })}
    </>
  )
}

export default Modals
