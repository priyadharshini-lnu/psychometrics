import { useMemo } from 'react'
import { List } from 'antd'
import VirtualList from 'rc-virtual-list'
import _ from 'lodash'
import AutoSizer from 'react-virtualized-auto-sizer'
import QuestionSerializer from '~/modules/survey/models/QuestionSerializer'
import Scoring from '~/modules/survey/views/Scoring'

type Block ={
  id: string,
  name: string,
  isBlock: boolean
}

const renderBlocks = (blocks): Block[] => _.compact(_.flatten(
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

  if (!selectedFactor) {
    return (
      <div>Relative dimension has not factors for scoring</div>
    )
  }

  return (
    <div style={{ height: '100%' }}>
      <AutoSizer>
        {({ height, width }) => (
          <>
            {(scorings && blocks) ? (
              <List style={{ height, width }}>
                <VirtualList
                  data={data}
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
  )
}

export default ScoringList
