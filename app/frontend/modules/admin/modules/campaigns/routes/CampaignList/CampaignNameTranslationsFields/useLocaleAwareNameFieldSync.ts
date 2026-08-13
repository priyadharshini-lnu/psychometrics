import { useEffect, useRef } from 'react'
import { Form } from 'antd'
import { FormInstance } from 'antd/es/form'

type Props = {
  form: FormInstance
  appLocale: string
  editingLocale: string
  sourceFieldName: string
  targetFieldName: string
}

export const useLocaleAwareNameFieldSync = ({
  form,
  appLocale,
  editingLocale,
  sourceFieldName,
  targetFieldName,
}: Props) => {
  const isSyncing = useRef(false)
  const previousSourceValue = useRef<string | undefined>(undefined)
  const previousTargetValue = useRef<string | undefined>(undefined)

  const sourceValue = Form.useWatch(sourceFieldName, form)
  const targetValue = Form.useWatch(targetFieldName, form)

  useEffect(() => {
    if (isSyncing.current) {
      isSyncing.current = false
      previousSourceValue.current = sourceValue
      previousTargetValue.current = targetValue
      return
    }

    // Keep both fields linked only while editing the current app locale.
    if (editingLocale !== appLocale) {
      previousSourceValue.current = sourceValue
      previousTargetValue.current = targetValue
      return
    }

    const didSourceChange = sourceValue !== previousSourceValue.current
    const didTargetChange = targetValue !== previousTargetValue.current

    if (didSourceChange && !didTargetChange && sourceValue !== targetValue) {
      isSyncing.current = true
      form.setFieldValue(targetFieldName, sourceValue)
    } else if (didTargetChange && !didSourceChange && targetValue !== sourceValue) {
      isSyncing.current = true
      form.setFieldValue(sourceFieldName, targetValue)
    }

    previousSourceValue.current = sourceValue
    previousTargetValue.current = targetValue
  }, [
    appLocale,
    editingLocale,
    form,
    sourceFieldName,
    sourceValue,
    targetFieldName,
    targetValue,
  ])
}
