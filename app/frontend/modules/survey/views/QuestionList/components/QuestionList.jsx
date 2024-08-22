import { useMemo } from 'react'
import FlipMove from 'react-flip-move'
import { List } from 'antd'
import VirtualList from 'rc-virtual-list'
import AutoSizer from 'react-virtualized-auto-sizer'
import styles from './QuestionList.less'
import PageBreak from '~/modules/survey/components/PageBreak'
import Question from '~/modules/survey/views/Question'

export default function QuestionList ({ block, questions, search }) {
  return (
    questions.length > 100
      ? <VirtualQuestionList block={block} questions={questions} search={search} />
      : (
        <div className={styles.main}>
          <FlipMove style={{ position: 'initial' }}>
            {questions.map(question => (
              <div key={question.id}>
                {question.type === 'PageBreak'
                  ? <PageBreak block={block} model={question} key={question.id} />
                  : <Question model={question} block={block} />}
              </div>
            ))}
          </FlipMove>
        </div>
      )
  )
}


function VirtualQuestionList ({ block, questions, search }) {
  const data = useMemo(() => {
    if (!search) return questions
    return questions.filter(question => question.name?.toLowerCase().includes(search.toLowerCase())
      || question.props.questionText?.toLowerCase().includes(search.toLowerCase()))
  }, [search, questions])

  return (
    <div className={styles.virtual}>
      <AutoSizer>
        {({ height, width }) => (
          <>
            <List style={{ height, width }}>
              <VirtualList
                data={data}
                height={height}
                itemHeight={100}
                itemKey="id"
              >
                {question => (
                  <div key={`question${question.id}`} className={styles.item}>
                    {question.type === 'PageBreak'
                      ? <PageBreak block={block} model={question} key={question.id} />
                      : <Question model={question} block={block} />}
                  </div>
                )}
              </VirtualList>
            </List>
          </>
        )}
      </AutoSizer>
    </div>
  )
}
