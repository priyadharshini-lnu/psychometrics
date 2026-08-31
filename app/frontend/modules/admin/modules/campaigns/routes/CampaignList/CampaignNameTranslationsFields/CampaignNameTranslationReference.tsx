import { Alert } from 'antd'

type Props = {
  isLoading: boolean
  referenceLocale?: string
  referenceValue: string
}

export const CampaignNameTranslationReference = ({
  isLoading,
  referenceLocale,
  referenceValue,
}: Props) => {
  if (isLoading || !referenceLocale || !referenceValue) return null

  return <Alert type="info" message={referenceValue} />
}
