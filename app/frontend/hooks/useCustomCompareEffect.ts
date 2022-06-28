import {
  DependencyList, EffectCallback, useEffect, useRef,
} from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isPrimitive = (val: any) => val !== Object(val)

type DepsEqualFnType<TDeps extends DependencyList> = (prevDeps: TDeps, nextDeps: TDeps) => boolean;

export const useCustomCompareEffect = <TDeps extends DependencyList>(
  effect: EffectCallback,
  deps: TDeps,
  depsEqual: DepsEqualFnType<TDeps>,
) => {
  if (!__PROD__) {
    if (!(deps instanceof Array) || !deps.length) {
      console.warn(
        '`useCustomCompareEffect` should not be used with no dependencies. Use React.useEffect instead.',
      )
    }

    if (deps.every(isPrimitive)) {
      // eslint-disable-next-line max-len
      console.warn('`useCustomCompareEffect` should not be used with dependencies that are all primitive values. Use React.useEffect instead.')
    }

    if (typeof depsEqual !== 'function') {
      console.warn(
        '`useCustomCompareEffect` should be used with depsEqual callback for comparing deps list',
      )
    }
  }

  const ref = useRef<TDeps | undefined>(undefined)

  if (!ref.current || !depsEqual(deps, ref.current)) {
    ref.current = deps
  }

  useEffect(effect, ref.current)
}
