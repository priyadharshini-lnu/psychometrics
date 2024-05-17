import _ from 'lodash'
import { Component } from 'react'
import {
  Slider, InputNumber, Row, Col, Collapse, Input,
  Tabs, Select, Tag,
} from 'antd'
import { ErrorBoundary } from 'react-error-boundary'
import { Properties } from '~/modules/reports/components/modules'
import ModuleModel from '~/modules/reports/models/Module'
import LayoutManager from '~/modules/reports/models/LayoutManager'
import styles from './PropertyPanel.less'
import StylesEditor from '~/modules/reports/components/StylesEditor'

const { $ } = window
const { Panel } = Collapse

class PropertyPanel extends Component {
  state = {
    popupOpen: false,
    currentTab: 'properties',
  }

  componentDidMount () {
    $(this.inspector).on('show.bs.dropdown', `.${styles.dropdownWrapper}, .color-picker`, () => {
      this.scrollTop = this.inspector.scrollTop
      this.setState({ popupOpen: true })
    })
    $(this.inspector).on('hide.bs.dropdown', `.${styles.dropdownWrapper}, .color-picker`, () => {
      this.scrollTop = 0
      this.setState({ popupOpen: false })
    })
  }

  componentDidUpdate (prevProps) {
    const { selected } = this.props

    // eslint-disable-next-line react/no-did-update-set-state
    prevProps.selected !== selected && this.setState({ currentTab: 'properties' })
  }

  onChangePosition = (value) => {
    const { module } = this.props
    const position = { ...module.props.position, ...value }
    module.props.position = position
    this.forceUpdate()
  }

  onChangeName = (e) => {
    const { module, updateModule } = this.props
    updateModule({ ...module, name: e.currentTarget.value })
  }

  updateModule = () => {
    const { module, updateModule } = this.props
    updateModule({ ...module })
  }

  layoutHandler = (method) => {
    const { module } = this.props
    const model = new ModuleModel(module, { id: module.page_id })

    const layout = new LayoutManager({})
    layout[method](model)
    model.update()
  }

  changeStyles = (val) => {
    const { module, updateModule, reportStyles } = this.props
    const filteredValues = val.filter(v => reportStyles[v])
    updateModule({ ...module, props: { ...module.props, styleIds: filteredValues } })
  }

  showOnAllPages = () => {
    const { module } = this.props
    const model = new ModuleModel(module, { id: module.page_id })
    model.props.showOnAllPages = !model.props.showOnAllPages
    model.update()
  }

  hideOnDashboard = () => {
    const { module } = this.props
    const model = new ModuleModel(module, { id: module.page_id })
    model.props.hideOnDashboard = !model.props.hideOnDashboard
    model.update()
  }

  renderCustomProperties () {
    const { selected, module, page } = this.props

    if ((!module && !page) || !selected) {
      return
    }

    const type = selected.type === 'Module' ? module.type : selected.type

    const View = Properties[`${type}Properties`]
    if (!View) { return }

    const model = new ModuleModel(module, { id: module.page_id })
    return (
      <ErrorBoundary
        key={module.id}
        fallbackRender={() => (
          <p style={{ color: '#f00' }}>{I18n.t('errors.module_props_error')}</p>
        )}
      >
        <View model={model || page} />
      </ErrorBoundary>
    )
  }

  renderSlider (props, label) {
    return (
      <Row align="middle">
        <Col span={2}>{label}</Col>
        <Col span={16}>
          <Slider {...props} onAfterChange={() => this.updateModule()} />
        </Col>
        <Col span={6}>
          <InputNumber
            controls={false}
            className={styles.antInput}
            onPressEnter={() => this.updateModule()}
            {...props}
          />
        </Col>
      </Row>
    )
  }

  renderLayout () {
    const { module, report: { builder: { props } } } = this.props
    if (!module) { return null }
    const { width, height } = props.sizes
    const { position } = module.props
    return (
      <>
        <hr className={styles.divider} />
        <div>
          <div className={styles.title}>Dimension</div>
          <div className={styles.pagePreview} style={{ width: width / 10, height: height / 10 }}>
            <div
              className={styles.modulePreview}
              style={{
                width: position.width / 10,
                height: position.height / 10,
                left: position.left / 10 - 1,
                top: position.top / 10 - 1,
              }}
            />
          </div>
        </div>
        <Collapse accordion className={styles.propertiesPanel}>
          <Panel header="Dimensions" key="Dimensions">
            {this.renderSlider({
              value: position.width,
              min: 0,
              max: width - position.left,
              onChange: value => this.onChangePosition({ width: value }),
            }, 'W:')}
            {this.renderSlider({
              value: position.height,
              min: 0,
              max: height - position.top,
              onChange: value => this.onChangePosition({ height: value }),
            }, 'H:')}
          </Panel>
          <Panel header="Co-ordinates" key="Co-ordinates">
            {this.renderSlider({
              value: position.left,
              min: 0,
              max: width - position.width,
              onChange: value => this.onChangePosition({ left: value }),
            }, 'X:')}
            {this.renderSlider({
              value: position.top,
              min: 0,
              max: height - position.height,
              onChange: value => this.onChangePosition({ top: value }),
            }, 'Y:')}
          </Panel>
        </Collapse>
        <hr className={styles.divider} />
        <div className={styles.layout}>
          Layout
          <ul className={styles.variants}>
            {_.map(['alignLeft', 'alignRight', 'alignTop', 'alignBottom', 'alignMiddleVertical',
              'alignMiddleHorizontal'], type => (
                <li key={type}>
                  <a
                    className={`${styles.alignedBlock} ${styles[type]}`}
                    onClick={e => this.layoutHandler(type, e)}
                  />
                </li>
            ))}
          </ul>
          <ul>
            <li><a onClick={e => this.layoutHandler('moveInFront', e)}>Bring Forward</a></li>
            <li><a onClick={e => this.layoutHandler('moveInBack', e)}>Send Backward</a></li>

            <li>
              <label>
                <input
                  type="checkbox"
                  checked={module.props.onTop || false}
                  onChange={e => this.layoutHandler('alwaysOnTop', e)}
                />
                Always On Top
              </label>
            </li>
            <li>
              <label>
                <input
                  type="checkbox"
                  checked={module.props.onBottom || false}
                  onChange={e => this.layoutHandler('alwaysOnBottom', e)}
                />
                Always On Bottom
              </label>
            </li>
            <li>
              <label>
                <input
                  type="checkbox"
                  checked={module.props.showOnAllPages || false}
                  onChange={() => this.showOnAllPages()}
                />
                Show On All Pages
              </label>
            </li>
            <li>
              <label>
                <input
                  type="checkbox"
                  checked={module.props.hideOnDashboard || false}
                  onChange={() => this.hideOnDashboard()}
                />
                Hide on Dashboard
              </label>
            </li>
          </ul>
        </div>
      </>
    )
  }

  render () {
    const { selected, module, reportStyles } = this.props
    const { popupOpen, currentTab } = this.state
    const inspectorClasses = [styles.inspector]
    let style = {}
    if (popupOpen) {
      inspectorClasses.push(styles.dropdownOpen)
      if (this.scrollTop > 0) {
        style = {
          marginTop: -this.scrollTop,
        }
      }
    }
    return (
      <div className={inspectorClasses.join(' ')} ref={(ref) => { this.inspector = ref }} style={style}>
        <Tabs
          tabBarStyle={{ padding: '0 10px', margin: 0, borderBottom: '1px solid #ccc' }}
          defaultActiveKey="properties"
          activeKey={currentTab}
          onChange={tab => this.setState({ currentTab: tab })}
          items={[{
            label: 'Properties',
            key: 'properties',
            children: (
              <div className={styles.main}>
                {selected.type === 'Module' && module && (
                  <>
                    <div>
                      <div className={styles.title}>Module Name:</div>
                      <div>
                        <Input key={module.id} value={module.name} onChange={this.onChangeName} />
                      </div>
                    </div>
                    <div className="margin-top-10">Styles</div>
                    <Select
                      mode="tags"
                      size="small"
                      showSearch
                      filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                      style={{ width: '100%' }}
                      value={module.props.styleIds.filter(s => reportStyles[s])}
                      options={_.map(reportStyles, style => ({ value: style.id, label: style.name }))}
                      tagRender={({ label, value, onClose }) => {
                        const deleted = !_.find(reportStyles, { id: value })
                        return (
                          <Tag
                            color={deleted ? 'red' : 'green'}
                            closable
                            onClose={onClose}
                          >
                            {deleted ? 'DELETED' : label}
                          </Tag>
                        )
                      }}
                      onChange={this.changeStyles}
                    />
                    <hr className={styles.divider} />
                  </>
                )}
                {this.renderCustomProperties()}
                {selected.type === 'Module' && this.renderLayout()}
              </div>
            ),
          }, {
            label: 'Styles',
            key: 'styles',
            children: (
              <StylesEditor />
            ),
          }]}
        />

      </div>
    )
  }
}

export default PropertyPanel
