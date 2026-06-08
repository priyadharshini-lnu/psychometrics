import { message } from 'antd'
import humps from 'humps'
import { UserSavedFilter } from './core'
import { useResources } from '~/hooks/useResources'

const { I18n } = window


export const useUserSavedFiltersApi = () => {
  const { collectionAction } = useResources<UserSavedFilter>('user_saved_filters')

  const fetchFilters = async (resourceType: string) => {
    try {
      const data = await collectionAction({
        method: 'get',
        action: '',
        apiConfig: {
          filter: {
            resource_type_eq: resourceType,
          },
        },
      })
      const filters = humps.decamelizeKeys(data as UserSavedFilter[] || {})
      return filters
    } catch (err) {
      message.error(I18n.t('admin.report_approval_saving_filters_error_while_fetching'))
    }
  }

  const createFilter = async (requestBody) => {
    try {
      const data = await collectionAction({
        method: 'post',
        action: '',
        body: requestBody,
      })
      message.success(I18n.t('admin.report_approval_saving_filters_save_filter'))
      return data
    } catch (error) {
      const errorMessage = error?.name?.title
      || I18n.t('admin.report_approval_saving_filters_error_while_saving')
      message.error(errorMessage)
      throw error
    }
  }

  const updateFilter = async (id: string, action: string, body: Record<string, unknown>, translateKey: string) => {
    try {
      await collectionAction({
        method: 'patch',
        action: `${id}`,
        body,
      })
      message.success(I18n.t(`admin.report_approval_saving_filters_${translateKey}`))
    } catch (error) {
      message.error(I18n.t('admin.report_approval_saving_filters_error_while_editing'))
      throw error
    }
  }

  const deleteFilter = async (id: string) => {
    try {
      await collectionAction({
        method: 'delete',
        action: `${id}`,
      })
      message.success(I18n.t('admin.report_approval_saving_filters_delete_saved_filters'))
    } catch (error) {
      message.error(I18n.t('admin.report_approval_saving_filters_error_while_deleting'))
    }
  }

  return {
    fetchFilters,
    createFilter,
    updateFilter,
    deleteFilter,
  }
}
