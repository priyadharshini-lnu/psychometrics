import { useState, useEffect, useRef } from 'react'
import _ from 'lodash'
import {
  Slider, InputNumber, Row, Col, Collapse, Input, Tabs, Select, Tag,
} from 'antd'
import { ErrorBoundary } from 'react-error-boundary'
import { Properties } from '~/modules/reports/components/modules'
import ModuleModel from '~/modules/reports/models/Module'
import LayoutManager from '~/modules/reports/models/LayoutManager'
import styles from './PropertyPanel.less'
import StylesEditor from '~/modules/reports/components/StylesEditor'

const { $ } = window
const { Panel } = Collapse
const AlignTypes = [
  'alignLeft',
  'alignRight',
  'alignTop',
  'alignBottom',
  'alignMiddleVertical',
  'alignMiddleHorizontal',
]

const uniqType = (modules) => {
  const res = _.uniqBy(modules, 'type')
  if (modules.length > 1 && res.length > 1) { return false }
  return res[0].type
}


const PropertyPanel = (props) => {
  const lang = new URLSearchParams(window.location.search).get('lang') || 'en'
  const isRTL = ['ar', 'he'].includes(lang)

  const [popupOpen, setPopupOpen] = useState(false)
  const [currentTab, setCurrentTab] = useState('properties')
  const inspector = useRef(null)
  const [scrollTop, setScrollTop] = useState(0)

  const {
    updateModule, reportStyles, report, modules,
  } = props
  const module = modules[0]

  useEffect(() => {
    const inspectorEl = $(inspector.current)
    inspectorEl.on('show.bs.dropdown', `.${styles.dropdownWrapper}, .color-picker`, () => {
      setScrollTop(inspector.current.scrollTop)
      setPopupOpen(true)
    })
    inspectorEl.on('hide.bs.dropdown', `.${styles.dropdownWrapper}, .color-picker`, () => {
      setScrollTop(0)
      setPopupOpen(false)
    })

    return () => {
      inspectorEl.off('show.bs.dropdown')
      inspectorEl.off('hide.bs.dropdown')
    }
  }, [])

  const onChangePosition = (value) => {
    modules.forEach((module) => {
      const position = { ...module.props.position, ...value }
      module.props.position = position
      updateModule({ ...module })
    })
  }

  const onChangeName = (e) => {
    modules.forEach((module) => {
      updateModule({ ...module, name: e.currentTarget.value })
    })
  }

  const layoutHandler = (method) => {
    modules.forEach((module) => {
      const model = new ModuleModel(module, { id: module.page_id })
      const layout = new LayoutManager({})
      layout[method](model)
      model.update()
    })
  }

  const changeStyles = (val) => {
    const filteredValues = val.filter(v => reportStyles[v])
    modules.forEach((module) => {
      updateModule({ ...module, props: { ...module.props, styleIds: filteredValues } })
    })
  }

  const showOnAllPages = () => {
    modules.forEach((module) => {
      const model = new ModuleModel(module, { id: module.page_id })
      model.props.showOnAllPages = !model.props.showOnAllPages
      model.update()
    })
  }

  const hideOnDashboard = () => {
    modules.forEach((module) => {
      const model = new ModuleModel(module, { id: module.page_id })
      model.props.hideOnDashboard = !model.props.hideOnDashboard
      model.update()
    })
  }

  const renderCustomProperties = () => {
    if (!module) {
      return null
    }

    const type = uniqType(modules)
    if (!type) { return null }

    const View = Properties[`${type}Properties`]

    return (
      <ErrorBoundary
        key={module.id}
        fallbackRender={() => (
          <p style={{ color: '#f00' }}>{I18n.t('errors.module_props_error')}</p>
        )}
      >
        <View modules={modules} />
      </ErrorBoundary>
    )
  }

  const renderSlider = (props, label) => (
    <Row align="middle">
      <Col span={2}>{label}</Col>
      <Col span={16}>
        <Slider {...props} onAfterChange={updateModule} />
      </Col>
      <Col span={6}>
        <InputNumber
          controls={false}
          className={styles.antInput}
          onPressEnter={updateModule}
          {...props}
        />
      </Col>
    </Row>
  )

  const renderLayout = () => {
    if (!modules.length > 0) return null
    const { width, height } = report.builder.props.sizes
    const module = modules[0]
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
            {renderSlider({
              value: position.width,
              min: 0,
              max: width - position.left,
              onChange: value => onChangePosition({ width: value }),
            }, 'W:')}
            {renderSlider({
              value: position.height,
              min: 0,
              max: height - position.top,
              onChange: value => onChangePosition({ height: value }),
            }, 'H:')}
          </Panel>
          <Panel header="Co-ordinates" key="Co-ordinates">
            {renderSlider({
              value: isRTL ? width - position.left - position.width : position.left,
              min: 0,
              max: width - position.width,
              onChange: value => onChangePosition({ left: isRTL ? width - value - position.width : value }),
            }, 'X:')}
            {renderSlider({
              value: position.top,
              min: 0,
              max: height - position.height,
              onChange: value => onChangePosition({ top: value }),
            }, 'Y:')}
            {renderSlider({
              value: position.rotation || 0,
              min: -180,
              max: 180,
              onChange: value => onChangePosition({ rotation: value }),
            }, 'R:')}
          </Panel>
        </Collapse>
        <hr className={styles.divider} />
        <div className={styles.layout}>
          Layout
          <ul className={styles.variants}>
            {_.map(AlignTypes, type => (
              <li key={type}>
                <a
                  className={`${styles.alignedBlock} ${styles[type]}`}
                  onClick={() => layoutHandler(type)}
                />
              </li>
            ))}
          </ul>
          <ul>
            <li><a onClick={() => layoutHandler('moveInFront')}>Bring Forward</a></li>
            <li><a onClick={() => layoutHandler('moveInBack')}>Send Backward</a></li>
            <li>
              <label>
                <input
                  type="checkbox"
                  checked={module.props.onTop || false}
                  onChange={() => layoutHandler('alwaysOnTop')}
                />
                Always On Top
              </label>
            </li>
            <li>
              <label>
                <input
                  type="checkbox"
                  checked={module.props.onBottom || false}
                  onChange={() => layoutHandler('alwaysOnBottom')}
                />
                Always On Bottom
              </label>
            </li>
            <li>
              <label>
                <input
                  type="checkbox"
                  checked={module.props.showOnAllPages || false}
                  onChange={showOnAllPages}
                />
                Show On All Pages
              </label>
            </li>
            <li>
              <label>
                <input
                  type="checkbox"
                  checked={module.props.hideOnDashboard || false}
                  onChange={hideOnDashboard}
                />
                Hide on Dashboard
              </label>
            </li>
          </ul>
        </div>
      </>
    )
  }

  const inspectorClasses = [styles.inspector]
  let style = {}
  if (popupOpen) {
    inspectorClasses.push(styles.dropdownOpen)
    if (scrollTop > 0) {
      style = {
        marginTop: -scrollTop,
      }
    }
  }

  return (
    <div className={inspectorClasses.join(' ')} ref={inspector} style={style}>
      <Tabs
        tabBarStyle={{ padding: '0 10px', margin: 0, borderBottom: '1px solid #ccc' }}
        defaultActiveKey="properties"
        activeKey={module ? currentTab : 'styles'}
        onChange={setCurrentTab}
        items={[
          module && {
            label: 'Properties',
            key: 'properties',
            children: (
              <div className={styles.main}>
                <>
                  <div>
                    <div className={styles.title}>Module Name:</div>
                    <div>
                      <Input key={module.id} value={module.name} onChange={onChangeName} />
                    </div>
                  </div>
                  <div className="margin-top-10">Styles</div>
                  <Select
                    mode="tags"
                    size="small"
                    showSearch
                    filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    style={{ width: '100%' }}
                    value={module.props.styleIds?.filter(s => reportStyles[s])}
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
                    onChange={changeStyles}
                  />
                  <hr className={styles.divider} />
                </>
                {renderCustomProperties()}
                {renderLayout()}
              </div>
            ),
          },
          {
            label: 'Styles',
            key: 'styles',
            children: <StylesEditor />,
          },
        ].filter(f => f)}
      />
    </div>
  )
}

export default PropertyPanel
