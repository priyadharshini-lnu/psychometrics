import { useMemo, useState } from 'react'
import { List, Input } from 'antd'
import VirtualList from 'rc-virtual-list'
import _ from 'lodash'
import AutoSizer from 'react-virtualized-auto-sizer'
import QuestionSerializer from '~/modules/survey/models/QuestionSerializer'
import Scoring from '~/modules/survey/views/Scoring'
import styles from './ScoringList.less'

type Item ={
  id: string,
  name: string,
  isBlock: boolean,
  props: {
    questionText: string
  }
}

const renderBlocks = (blocks): Item[] => _.compact(_.flatten(
  blocks.map(block => [
    { id: `${block.id}`, name: block.name, isBlock: true },
    ...(block.questions && block.questions?.map(question => (
      question
    ))) || [],
  ]),
))

const ScoringList = ({
  blocks, type, scorings, recoding, selectedFactor,
}) => {
  const data = useMemo(() => renderBlocks(blocks), [blocks])
  const [search, setSearch] = useState('')

  const filteredData = useMemo(() => {
    if (!search) return data
    return data.filter(item => !item.isBlock
      && (item.name?.toLowerCase().includes(search.toLowerCase())
        || item.props.questionText?.toLowerCase().includes(search.toLowerCase())))
  }, [search, data])

  if (!selectedFactor) {
    return (
      <div>Relative dimension has not factors for scoring</div>
    )
  }


  return (
    <>
      <div className={styles.header}>
        <Input.Search
          placeholder="type to search question"
          className={styles.search}
          onChange={e => setSearch(e.currentTarget.value)}
          allowClear
        />
      </div>

      <div style={{ height: '100%' }}>

        <AutoSizer>
          {({ height, width }) => (
            <>
              {(scorings && blocks) ? (
                <List style={{ height, width }}>
                  <VirtualList
                    data={filteredData}
                    height={height}
                    itemHeight={47}
                    itemKey="id"
                  >
                    {item => (
                      <List.Item key={item.isBlock ? `block_${item.id}` : `question${item.id}`}>
                        { item.isBlock ? <div className="panel-heading">{item.name}</div>
                          : (
                            <Scoring
                              type={type}
                              model={QuestionSerializer.wrap(item)}
                              scorings={scorings}
                              recoding={recoding}
                            />
                          )
                        }
                      </List.Item>
                    )}
                  </VirtualList>
                </List>
              ) : null
            }
            </>
          )}
        </AutoSizer>
      </div>
    </>
  )
}

export default ScoringList
