import { FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { Space, Divider, Button } from 'antd'
import {
  EyeOutlined, EyeInvisibleOutlined, LockOutlined, UnlockOutlined,
} from '@ant-design/icons'
import _ from 'lodash'
import cs from 'classnames'
import { getModules } from '~/modules/reports/core/builder/selectors'
import {
  closeRichEditor, selectModule, unselectModules, SelectedTypes,
} from '~/modules/reports/core/builder/actions'
import { updateModule } from '~/modules/reports/core/builder/module/actions'
import { RootState } from '~/modules/reports/core/rootReducers'
import panelStore from '~/modules/reports/store/PropertyPanelStore'
import ScrollDispatcher from '~/modules/reports/dispatchers/ScrollDispatcher'
import utils from '~/modules/reports/utils/Utils'
import iconStyles from '~/modules/reports/components/modules/Graph/components/ChartsMenu.less'

import styles from './ModuleList.less'

const connector = connect((state: RootState, props: OwnProps) => ({
  modules: getModules(state.report, props.page.modules),
  selected: state.report.builder.selected,
}), {
  selectModule,
  unselectModules,
  closeRichEditor,
  updateModule,
})

export type PropsFromRedux = ConnectedProps<typeof connector>
interface OwnProps {
  page: {
    id: number
    modules: number[]
  }
}
type Props = PropsFromRedux & OwnProps

const ICONS = {
  Table: 'table',
  Graph: 'bar-chart',
  Text: 'font',
  Image: 'image',
  Shape: 'pencil-square-o',
}

const ModuleIcon = ({ type }) => <span className={`${styles.icon} fa fa-${ICONS[type]}`} />

const ModuleLabel = ({
  module: {
    id, type, props, name,
  },
}) => {
  if (type === 'Text') {
    return <>{name || `${utils.stripHTML(props.text).slice(0, 45)}...`}</>
  }

  if (type === 'Graph') {
    return (
      <>
        {(props.type
          ? <span className={`${iconStyles[props.type]} ${iconStyles.icon} ${styles.chartIcon}`} />
          : 'Unselected ')}
        {name}
      </>
    )
  }

  if (type === 'Table') {
    return (
      <>{name || `${props.type || 'Unselected'}`}</>
    )
  }

  if (type === 'Image') {
    return (
      <>
        <img src={props.url} />
        {name || 'Image'}
      </>
    )
  }

  if (type === 'Shape') {
    const { backgroundColor, borderColor, borderRadius } = props.style
    const { position } = props
    const width = position.width / 20
    const height = position.height / 20
    const radius = borderRadius / 20
    const style = {
      backgroundColor: `rgba(${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b}, ${backgroundColor.a})`,
      border: '0.2px solid',
      borderColor: `rgba(${borderColor.r}, ${borderColor.g}, ${borderColor.b}, ${borderColor.a})`,
      borderRadius: radius,
      width,
      height,
    }

    return (
      <>
        <span
          className={styles.shape}
          style={style}
        />
        {' '}
        {name || 'Shape'}
      </>
    )
  }

  return <>{`${type} ID#${id}`}</>
}

const ModuleListComponent: FC<Props> = ({
  page,
  modules,
  selected,
  selectModule,
  unselectModules,
  closeRichEditor,
  updateModule,
}) => {
  const select = (module) => {
    if (module.meta.locked || module.meta.visible === false) {
      ScrollDispatcher.scroll(page.id, `Module_${module.id}`)
      return
    }
    unselectModules()
    selectModule(SelectedTypes.Module, module.id)
    closeRichEditor()
    panelStore.select('Module', module)
    ScrollDispatcher.scroll(page.id, `Module_${module.id}`)
  }

  const toggleVisibility = (e, module) => {
    e.stopPropagation()
    updateModule({ ...module, meta: { ...module.meta, hidden: !module.meta.hidden } })
  }
  const toggleLocked = (e, module) => {
    e.stopPropagation()
    updateModule({ ...module, meta: { ...module.meta, locked: !module.meta.locked } })
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }} split={<Divider style={{ margin: 0 }} />} size={4}>
      {_.map(modules, module => !module.removed && (
        <div className={cs(styles.row, { [styles.selected]: selected.moduleId === module.id })} key={module.id}>
          <div className={styles.moduleName} onClick={() => select(module)}>
            <ModuleIcon type={module.type} />
            <span className={styles.name}><ModuleLabel module={module} /></span>
            <div>
              <Button size="small" onClick={e => toggleVisibility(e, module)}>
                {module.meta.hidden === true ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              </Button>
              <Button size="small" onClick={e => toggleLocked(e, module)}>
                {module.meta.locked ? <LockOutlined /> : <UnlockOutlined />}
              </Button>
            </div>
          </div>
        </div>
      ))}
    </Space>
  )
}


export const ModuleList = connector(ModuleListComponent)
