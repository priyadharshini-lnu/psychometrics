import { convertToInt } from '~/components/InputDuration'

interface DurationValidator {
    (options: {
        minMinutes: number
        maxMinutes: number
        minError: string
        maxError: string
        requiredError: string
        required?: boolean
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }): (rule: any, value: any) => Promise<void>
}

export const durationValidator: DurationValidator = ({
  minMinutes, maxMinutes, minError, maxError, requiredError, required = true,
}) => (_, value) => {
  if (!required && !value) {
    return Promise.resolve()
  }
  if (!value) {
    return Promise.reject(new Error(requiredError))
  }
  const minutes = convertToInt(value) / 60
  if (minutes > maxMinutes) {
    return Promise.reject(new Error(maxError))
  }
  if (minutes < minMinutes) {
    return Promise.reject(new Error(minError))
  }
  return Promise.resolve()
}
