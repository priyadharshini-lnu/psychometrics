import { FC, useMemo } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Flex,
  TreeSelect, Typography, GetProp, TreeSelectProps,
} from 'antd'
import {
  isEmpty,
  includes,
  toLower,
  toString,
  trim,
  some,
} from 'lodash'

import { useLocalStorage } from '~/hooks/useLocalStorage'
import { RootState } from '~/modules/reports/core/rootReducers'
import { PropertiesModel } from '~/modules/reports/interfaces/tables/Gap'

import { getQuestions } from '~/modules/reports/core/builder/selectors'
import { BasePropertiesModel as BaseQuestionModelInProperties } from '~/modules/survey/interfaces/questions/Base'

type TreeDataNode = GetProp<TreeSelectProps, 'treeData'>[number]

const AVAILABLE_QUESTION_TYPES = ['MatrixTable', 'SideBySide', 'Slider']
const QUESTION_CHOICE_SEPERATOR = '_'

const connector = connect((state: RootState) => ({
  getQuestions: (assessmentId: number) => getQuestions(state.report, assessmentId),
}))

type PropsFromRedux = ConnectedProps<typeof connector>

interface OwnProps {
  assessmentId: PropertiesModel['assessment_id']
  value: PropertiesModel['props']['questionsChoices']
  onChange(key: string, value: unknown): void
}

type Props = PropsFromRedux & OwnProps

const QuestionListComponent: FC<Props> = ({
  assessmentId,
  value,
  onChange,
  getQuestions,
}) => {
  const handleOnChange = (selectedNodes: Array<string>) => {
    const selectedQuestionsChoices = treeValuesToQuestionChoices(selectedNodes)
    onChange('questionsChoices', selectedQuestionsChoices)
  }

  const questions = getQuestions(assessmentId)
  const questionChoicesInTree = useMemo(() => (
    questionsToTreeDataStructure(questions)
  ), [questions])

  const treeSelectedValues = questionChoicesToTreeValues(value)

  const [settings] = useLocalStorage('reportSettings', {
    propertiesPanel: {
      width: 280,
    },
  })

  const filterTreeNode = (inputValue: string, treeNode: TreeDataNode): boolean => {
    const searchValue = toLower(trim(inputValue))
    if (isEmpty(searchValue)) return true

    // Check if the current node title matches
    const nodeTitle = toLower(toString(treeNode.title ?? ''))
    if (includes(nodeTitle, searchValue)) {
      return true
    }

    // For parent nodes, check if any children match (with null safety)
    if (treeNode.children && treeNode.children.length > 0) {
      return some(treeNode.children, (child: TreeDataNode) => {
        const childTitle = toLower(toString(child.title ?? ''))
        return includes(childTitle, searchValue)
      })
    }

    return false
  }

  return (
    <Flex vertical gap={8}>
      <Typography.Text>Question choices</Typography.Text>
      <TreeSelect
        style={{ width: `calc(${settings.propertiesPanel.width}px - 30px)` }}
        multiple
        maxTagCount={2}
        treeCheckable
        showSearch
        filterTreeNode={filterTreeNode}
        treeData={questionChoicesInTree}
        placeholder="All question choices"
        value={treeSelectedValues}
        onChange={handleOnChange}
        treeDefaultExpandAll
        allowClear
      />
    </Flex>
  )
}

// Tree can be shown to those questions which contains many choice options
interface BaseQuestionProps {
  choicesTexts: Array<string>
}

export const questionsToTreeDataStructure = (
  questions: Record<number, BaseQuestionModelInProperties<BaseQuestionProps>>,
): Array<TreeDataNode> => {
  if (Object.keys(questions).length === 0) {
    return []
  }

  const filteredQuestion = Object.values(questions).filter(question => AVAILABLE_QUESTION_TYPES.includes(question.type))

  if (filteredQuestion.length === 0) {
    return []
  }

  const questionsNodes: Array<TreeDataNode> = []

  filteredQuestion.forEach((question) => {
    const {
      props: { choicesTexts },
      name,
      id,
    } = question
    if (name.length !== 0 && choicesTexts.length !== 0) {
      const choices = choicesTexts.map((choice, index) => ({
        title: choice,
        value: `${id}${QUESTION_CHOICE_SEPERATOR}${index}`,
      }))
      questionsNodes.push({
        title: name,
        value: id,
        children: choices,
      })
    }
  })
  return questionsNodes
}

export const treeValuesToQuestionChoices = (
  treeSelectedValues: Array<string> = [],
): Array<{
  questionId: number
  choiceIds: Array<number>
}> => {
  const selectedQuestionsChoicesMap = new Map<
    string,
    { questionId: number; choiceIds: Array<number> }
  >()

  treeSelectedValues.forEach((selectedNode) => {
    const [selectedQuestionId, selectedChoiceId] = selectedNode.split(
      QUESTION_CHOICE_SEPERATOR,
    )

    if (selectedQuestionId && selectedChoiceId) {
      const existingQuestionChoices = selectedQuestionsChoicesMap.get(selectedQuestionId)?.choiceIds ?? []

      const questionWithNewChoices = {
        questionId: parseInt(selectedQuestionId, 10),
        choiceIds: [...existingQuestionChoices, parseInt(selectedChoiceId, 10)],
      }

      selectedQuestionsChoicesMap.set(
        selectedQuestionId,
        questionWithNewChoices,
      )
    }
  })

  const selectedQuestionsChoices = Array.from(selectedQuestionsChoicesMap).map(
    ([, selectedQuestionChoices]) => selectedQuestionChoices,
  )

  return selectedQuestionsChoices
}

export const questionChoicesToTreeValues = (
  questionsChoices: PropertiesModel['props']['questionsChoices'] = [],
): Array<string> => {
  const treeValue: Array<string> = []

  questionsChoices.forEach((questionChoices) => {
    const { questionId = -1, choiceIds = [] } = questionChoices

    choiceIds.forEach((choice) => {
      treeValue.push(`${questionId}_${choice}`)
    })
  })
  return treeValue
}

export const QuestionList = connector(QuestionListComponent)
