import LabelEditor from '~/modules/reports/components/LabelEditor'
import I18nStore from '~/modules/reports/store/I18nStore'
import styles from './styles.less'

const NUMBER_HEADER = 'RATING'
const TEXT_HEADER = 'HEADING'

export default function Header ({ model, preview, update }) {
  const updateHeader = (text, name) => {
    model.props[name] = text
    update()
  }

  return (
    <li>
      <LabelEditor
        readOnly={preview}
        onChange={e => updateHeader(e, 'numberHeader')}
        value={I18nStore.tModule(model, 'numberHeader') || NUMBER_HEADER}
        styles={styles.number}
      />
      <LabelEditor
        readOnly={preview}
        onChange={e => updateHeader(e, 'textHeader')}
        value={I18nStore.tModule(model, 'textHeader') || TEXT_HEADER}
        styles={styles.text}
      />
    </li>
  )
}
