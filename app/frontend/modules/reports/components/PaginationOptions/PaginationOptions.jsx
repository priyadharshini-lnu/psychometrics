import { Select, Space } from 'antd'
import { connect } from 'react-redux'
import { HintCheckbox, HintTooltip } from '~/glint'
import { getPageModules } from '~/modules/reports/core/builder/selectors'

const { I18n } = window

export const PaginationOptions = ({ module, onChange, pageModules }) => {
  const changeEnabled = () => {
    onChange('pagination', {
      ...(module.props.pagination || {
        position: {
          left: 50, top: 50, width: 760, height: 1000,
        },
      }),
      repeatableModules: module.props.pagination?.repeatableModules || [],
      enabled: !module.props.pagination?.enabled,
      editFrame: false,
    })
  }
  const changeFrame = () => {
    onChange('pagination', {
      ...module.props.pagination,
      editFrame: !module.props.pagination?.editFrame,
    })
  }

  const changeRepeatableModules = (value) => {
    onChange('pagination', {
      ...module.props.pagination,
      repeatableModules: value,
    })
  }
  const anotherModuleHasPagination = pageModules.find(m => m.id !== module.id && m.props.pagination?.enabled) || false

  return (
    <>
      {I18n.t('administration.report_builder.pagination.module_pagination')}
      <div>
        <HintCheckbox
          disabled={anotherModuleHasPagination}
          label={I18n.t('administration.common.enabled')}
          checked={module.props.pagination?.enabled}
          onChange={changeEnabled}
          hints={[
            I18n.t('administration.report_builder.pagination.hints.pagination_on'),
            anotherModuleHasPagination
              ? I18n.t('administration.report_builder.pagination.hints.pagination_disabled')
              : I18n.t('administration.report_builder.pagination.hints.pagination_off'),
          ]}
        />
      </div>
      <div>
        <HintCheckbox
          disabled={!module.props?.pagination?.enabled}
          label={I18n.t('administration.report_builder.pagination.edit_frame')}
          checked={module.props.pagination?.editFrame}
          onChange={changeFrame}
          hints={[
            I18n.t('administration.report_builder.pagination.hints.frame_settings_on'),
            I18n.t('administration.report_builder.pagination.hints.frame_settings_off'),
          ]}
        />
      </div>
      <div>
        <HintTooltip hint={I18n.t('administration.report_builder.pagination.hints.repeat_modules')}>
          <Space direction="vertical" className="w-100">
            {I18n.t('administration.report_builder.pagination.repeat_modules')}
            <Select
              className="w-100"
              mode="multiple"
              value={module.props.pagination?.repeatableModules}
              options={pageModules.filter(m => m.id !== module.id).map(m => ({ label: m.name || m.type, value: m.id }))}
              onChange={changeRepeatableModules}
            />
          </Space>
        </HintTooltip>
      </div>
    </>
  )
}


export default connect((state, { module }) => ({
  pageModules: getPageModules(state.report, module.page),
}), {})(PaginationOptions)
