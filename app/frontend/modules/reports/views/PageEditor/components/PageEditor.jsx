import { Splitter } from 'antd'
import FixedHeader from '~/modules/reports/views/FixedHeader'
import PropertyPanel from '~/modules/reports/views/PropertyPanel'
import styles from './PageEditor.less'
import LeftSide from './LeftSide'
import RightSide from './RightSide'
import { useLocalStorage } from '~/hooks/useLocalStorage'

const PageEditor = (props) => {
  const [settings, updateSettings] = useLocalStorage('reportSettings', {
    propertiesPanel: {
      width: 280,
    },
  })

  const onResize = ([, right]) => {
    updateSettings({
      ...settings,
      propertiesPanel: {
        ...settings.propertiesPanel,
        width: right,
      },
    })
  }
  return (
    <div className={styles.main}>
      <FixedHeader />
      <Splitter onResize={onResize}>
        <Splitter.Panel min="70%">
          <LeftSide {...props} />
          <RightSide />
        </Splitter.Panel>
        <Splitter.Panel size={settings.propertiesPanel.width} min={280} max="30%">
          <PropertyPanel />
        </Splitter.Panel>
      </Splitter>
    </div>
  )
}
export default PageEditor
