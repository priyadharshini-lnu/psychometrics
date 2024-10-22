import React, { useState, useEffect } from 'react'
import DndElement from '~/components/DnD/DnDElement'
import styles from './styles.less'

export interface CampaignFactorType {
  code: string
  name: string
}

export interface CampaignFactors {
  campaignFactors: CampaignFactorType[],
}

interface Props {
  selectedCampaignFactors: CampaignFactorType[],
  update(CampaignFactors: CampaignFactorType[]): void
}

const SortableCampaignFactors: React.FC<Props> = ({ selectedCampaignFactors, update }) => {
  const [campaignFactors, setCampaignFactors] = useState(selectedCampaignFactors || [])
  useEffect(() => {
    setCampaignFactors(selectedCampaignFactors)
  }, [selectedCampaignFactors])

  const onDrag = (campaignFactors: CampaignFactorType[]) => {
    setCampaignFactors(campaignFactors)
    update(campaignFactors)
  }

  const renderCampaignFactor = (campaignFactor: { code: string, name: string }) => (
    <DndElement
      strategy="index"
      uniqField="code"
      element={campaignFactor}
      list={campaignFactors}
      onDrag={onDrag}
      key={campaignFactor.code}
      additionalWrapper
    >
      <div className={styles.campaignFactor}>
        {campaignFactor.name}
      </div>
    </DndElement>
  )

  return (
    <>
      {campaignFactors.map(campaignFactor => renderCampaignFactor(campaignFactor))}
    </>
  )
}

export default SortableCampaignFactors
