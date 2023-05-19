import { Radio, type RadioChangeEvent } from 'antd'
import { useParams, useHistory } from 'react-router-dom'
import styles from './Header.less'

interface Props {
  active: 'questions' | 'scoring' | 'resources'
}

export const Tabs: React.FC<Props> = ({ active }) => {
  const history = useHistory()
  const { id } = useParams<{ id: string }>()

  const change = (e: RadioChangeEvent) => {
    const val = e.target.value
    if (val === active) { return }
    if (val === 'questions') {
      return history.push(`/administration/assessments/${id}`)
    }
    if (val === 'scoring') {
      return history.push(`/administration/assessments/${id}/scoring`)
    }
    if (val === 'resources') {
      return history.push(`/administration/assessments/${id}/resources`)
    }
  }

  return (
    <div className={styles.tabs}>
      <Radio.Group onChange={change} defaultValue="questions" value={active} buttonStyle="solid">
        <Radio.Button value="questions">Questions</Radio.Button>
        <Radio.Button value="scoring">Scoring</Radio.Button>
        <Radio.Button value="resources">Resources</Radio.Button>
      </Radio.Group>
    </div>
  )
}
