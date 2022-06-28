import { DependencyList, EffectCallback } from 'react'
import isDeepEqual from 'lodash/isEqual'
import { useCustomCompareEffect } from './useCustomCompareEffect'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isPrimitive = (val: any) => val !== Object(val)

export const useDeepCompareEffect = (effect: EffectCallback, deps: DependencyList) => {
  if (!__PROD__) {
    if (!(deps instanceof Array) || !deps.length) {
      console.warn(
        '`useDeepCompareEffect` should not be used with no dependencies. Use React.useEffect instead.',
      )
    }

    if (deps.every(isPrimitive)) {
      // eslint-disable-next-line max-len
      console.warn('`useDeepCompareEffect` should not be used with dependencies that are all primitive values. Use React.useEffect instead.')
    }
  }

  useCustomCompareEffect(effect, deps, isDeepEqual)
}
