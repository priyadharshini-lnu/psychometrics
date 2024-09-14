import jsonpath from 'jsonpath/jsonpath.min'
import { useExceptionStore } from '~/core/exception'

export const captureSchemaValidationError = (data) => {
  if (typeof data !== 'object' || data === null) {
    return
  }

  const errors = jsonpath.query(data, '$..schema_validation_error')
  if (errors.length > 0) {
    const { setException } = useExceptionStore.getState()
    setException(JSON.parse(errors[0]))
  }
}
