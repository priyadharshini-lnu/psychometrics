import React from 'react'
import { useParams } from 'react-router-dom'
import {
  ApplicationsList,
} from '~/components/Applications'

export const Applications: React.FC = () => {
  const { clientId } = useParams() as { clientId: string }

  return (
    <ApplicationsList query={{ tenant_id: clientId }} />
  )
}
