import { Component } from 'react'
import PropTypes from 'prop-types'
import { Space, Dropdown, Button } from 'antd'
import { connect } from 'react-redux'
import {
  CopyOutlined, DownOutlined, EyeOutlined, SnippetsOutlined, DeleteOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { getPage } from '~/modules/reports/core/builder/selectors'
import LabelEditor from '~/modules/reports/components/LabelEditor'
import styles from './Page.less'
import { escapeSpecialChars } from '~/utils/string'
import Module from '~/modules/reports/models/Module'
import { removePage } from '~/modules/reports/core/builder/page/actions'
import { pastePage } from '~/modules/reports/core/builder/actions'


class PageHeader extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeName = (val) => {
    const { renamePage, model } = this.props
    renamePage(model.id, val)
  }

  addDisplayLogic = () => {
    const { model, openDisplayLogic } = this.props
    openDisplayLogic({ model })
  }

  removePage = () => {
    const { page, removePage } = this.props
    // eslint-disable-next-line no-alert
    if (!confirm('Are you sure you want to delete page?')) {
      return
    }
    removePage(page.id)
  }

  copyPage = () => {
    if (!navigator.clipboard) { return }

    const { page } = this.props
    const data = {
      type: 'Page',
      data: { page },
    }

    navigator.clipboard.writeText(escapeSpecialChars(JSON.stringify(data)))
  }

  pastePage = () => {
    if (!navigator.clipboard) { return }

    const { page, pastePage, report } = this.props
    navigator.clipboard.readText().then((text) => {
      try {
        const data = JSON.parse(text)
        if (data.type !== 'Page') { return }
        const modules = data.data.page.modules.map((m) => {
          const data = JSON.parse(JSON.stringify(m))
          data.id = null
          data.assessment_id = report.assessments[m.assessment_id] ? m.assessment_id : null
          return new Module(data, page)
        })

        // eslint-disable-next-line no-alert
        if (page.modules.length && !confirm('Are u sure? This action will replace modules on page.')) {
          return
        }
        pastePage(page.id, modules)
      } catch (e) { /* empty */ }
    })
  }

  render () {
    const { model } = this.props

    return (
      <div className={styles.header}>
        <div>
          <a><LabelEditor value={model.name || 'Page'} onChange={this.changeName} width={120} /></a>
        </div>
        <div className={styles.controls}>
          <Dropdown
            size="small"
            icon={<DownOutlined />}
            trigger={['click']}
            menu={{
              items: [{
                label: (
                  <Space>
                    <EyeOutlined />
                    Add Display Logic...
                  </Space>
                ),
                key: 'add_display_logic',
                onClick: this.addDisplayLogic,
              }, {
                type: 'divider',
              }, {
                label: (
                  <Space>
                    <CopyOutlined />
                    Copy All Modules
                  </Space>
                ),
                key: 'copy',
                onClick: this.copyPage,
              }, {
                label: (
                  <Space>
                    <SnippetsOutlined />
                    Paste Modules
                  </Space>
                ),
                key: 'paste',
                onClick: this.pastePage,
              }, {
                type: 'divider',
              }, {
                label: (
                  <Space>
                    <DeleteOutlined />
                    Delete Page...
                  </Space>
                ),
                key: 'delete',
                onClick: this.removePage,
              }],
            }}
          >
            <Button size="small">
              <Space>
                Page Options
                <SettingOutlined />
              </Space>
            </Button>
          </Dropdown>
        </div>
      </div>
    )
  }
}

export default connect((state, { model }) => ({
  page: getPage(state.report, model.id),
  report: state.report.builder,
}), {
  pastePage,
  removePage,
})(PageHeader)
