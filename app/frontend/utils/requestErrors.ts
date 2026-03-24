import _ from 'lodash'

interface ExtractFieldRequestErrorsOptions {
  pointerIncludes: string[]
  fallbackPaths: string[]
}

export const extractErrorTitle = (error: unknown): string | undefined => {
  if (_.isString(error)) return error

  if (Array.isArray(error)) {
    return error.map(extractErrorTitle).find(Boolean)
  }

  if (_.isPlainObject(error)) {
    return (
      _.get(error, 'title')
      || _.get(error, 'detail')
      || _.get(error, '[0].title')
      || _.get(error, '[0].detail')
    )
  }

  return undefined
}

export const extractFieldRequestErrors = (
  errors: unknown,
  options: ExtractFieldRequestErrorsOptions,
): string[] => {
  const normalizedErrors = Array.isArray(errors) ? errors[0] : errors

  const pointerErrors = _.compact(
    (_.get(normalizedErrors, 'errors', []) as unknown[]).map((error) => {
      const pointer = _.get(error, 'source.pointer', '')
      const isTargetPointer = _.isString(pointer)
        && options.pointerIncludes.some(pointerFragment => pointer.includes(pointerFragment))

      if (!isTargetPointer) return undefined

      return extractErrorTitle(error)
    }),
  )

  if (pointerErrors.length > 0) return pointerErrors

  return _.compact(options.fallbackPaths.map(path => extractErrorTitle(_.get(normalizedErrors, path))))
}
