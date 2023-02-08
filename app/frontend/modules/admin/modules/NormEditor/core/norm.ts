import NormFields from '~/modules/admin/modules/NormEditor/interfaces/NormFields'

export const SAVE_NORM = 'SAVE_NORM'

export const savePercentileNorm = (normId: number, data: NormFields) => ({
  type: SAVE_NORM,
  request: {
    url: '/administration/factors_norms/update_percentile_norm',
    method: 'put',
    body: { normId, normType: 'percentile', ...data },
  },
})
