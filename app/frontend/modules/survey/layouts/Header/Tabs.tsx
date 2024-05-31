import { Radio, type RadioChangeEvent } from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import styles from './Header.less'

interface Props {
  active: 'questions' | 'scoring' | 'resources'
}

export const Tabs: React.FC<Props> = ({ active }) => {
  const navigate = useNavigate()
  const { id } = useParams() as { id: string }

  const change = (e: RadioChangeEvent) => {
    const val = e.target.value
    if (val === active) { return }
    if (val === 'questions') {
      return navigate(`/administration/assessments/${id}`)
    }
    if (val === 'scoring') {
      return navigate(`/administration/assessments/${id}/scoring`)
    }
    if (val === 'resources') {
      return navigate(`/administration/assessments/${id}/resources`)
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
