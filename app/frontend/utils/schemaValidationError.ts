import { JSONPath } from 'jsonpath-plus'
import { useExceptionStore } from '~/core/exception'

export const captureSchemaValidationError = (data) => {
  if (typeof data !== 'object' || data === null) {
    return
  }

  const errors = JSONPath({ path: '$..schema_validation_error', json: data })
  if (errors.length > 0) {
    const { setException } = useExceptionStore.getState()
    setException(JSON.parse(errors[0]))
  }
}
