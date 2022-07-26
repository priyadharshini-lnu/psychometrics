import { RecoilState, useRecoilState } from 'recoil'

export function useRecoilStateStateManager<T> (atom: RecoilState<T>) {
  const [dashboardData, setDashboardDate] = useRecoilState<T>(atom)
  return { state: dashboardData, setState: setDashboardDate }
}
