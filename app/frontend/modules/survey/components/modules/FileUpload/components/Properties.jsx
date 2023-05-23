import { Component } from 'react'
import PropTypes from 'prop-types'
import { Select } from 'antd'
import styles from '~/modules/survey/views/PropertyPanel/components/PropertyPanel.less'
import RequiredValidations from '~/modules/survey/components/RequiredValidations'

const { Option } = Select

const ALLOWED_FILE_TYPES = ['csv', 'doc', 'docx', 'jpg', 'png', 'pdf', 'ppt', 'pptx', 'txt', 'xls', 'xlsx']
export class Properties extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    restricted: PropTypes.bool,
  }

  update = () => {
    const { model } = this.props
    model.update()
  }

  changeMaxFileSize = (e) => {
    const { model } = this.props
    const maxFileSize = parseInt(e.currentTarget.value, 10) || ''
    model.changeProps({ maxFileSize })
    this.update()
  }

  changeAllowedFileTypes = (_, options) => {
    const { model } = this.props
    const allowedFileTypes = options.map(opt => opt.key)
    model.changeProps({ allowedFileTypes })
    this.update()
  }

  render () {
    const { model, restricted } = this.props
    return (
      <div>
        <div className={styles.fieldset} style={{ position: 'relative' }}>
          <span className={styles.label}>Max File Size (MBs)</span>
          <input
            type="text"
            className="form-control"
            value={model.props.maxFileSize}
            onChange={this.changeMaxFileSize}
          />
        </div>
        <div className={styles.fieldset} style={{ position: 'relative' }}>
          <span className={styles.label}>Allowed file types</span>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Please select"
            value={model.props.allowedFileTypes}
            onChange={this.changeAllowedFileTypes}
          >
            {ALLOWED_FILE_TYPES.map(j => (<Option key={j}>{j}</Option>))}
          </Select>
        </div>
        <hr className={styles.divider} />
        {!restricted && (
          <RequiredValidations
            model={model}
            update={this.forceUpdate}
          />
        )}
      </div>
    )
  }
}

export default Properties
