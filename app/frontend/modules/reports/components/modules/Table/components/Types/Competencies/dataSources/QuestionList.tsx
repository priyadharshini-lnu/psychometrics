import { FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { TreeSelect, GetProp, TreeSelectProps } from 'antd'

import { RootState } from '~/modules/reports/core/rootReducers'
import Module from '~/modules/reports/core/interfaces/Module'
import { BasePropertiesModel } from '~/modules/survey/interfaces/questions/Base'
import { PropertiesModel as SideBySidePropertiesModel } from '~/modules/survey/interfaces/questions/SideBySide'
import { PropertiesModel as MatrixTablePropertiesModel } from '~/modules/survey/interfaces/questions/MatrixTable'
import { getQuestions } from '~/modules/reports/core/builder/selectors'

type TreeDataNode = GetProp<TreeSelectProps, 'treeData'>[number]

const AVAILABLE_QUESTION_TYPES = ['MatrixTable', 'SideBySide']
const QUESTION_CHOICE_SEPERATOR = '_'

const connector = connect((state: RootState) => ({
  getQuestions: (assessmentId: number) => getQuestions(state.report, assessmentId),
}))

type PropsFromRedux = ConnectedProps<typeof connector>

interface OwnProps {
  model: Module
  onChange(key: string, value: unknown): void
}

type Props = PropsFromRedux & OwnProps

const QuestionListComponent: FC<Props> = ({
  model,
  onChange,
  getQuestions,
}) => {
  const handleOnChange = (selectedNodes: Array<string>) => {
    const selectedQuestionsChoices = treeValuesToQuestionChoices(selectedNodes)
    onChange('questionsChoices', selectedQuestionsChoices)
  }

  const {
    assessment_id,
    props: { questionsChoices },
  } = model

  const questions = getQuestions(assessment_id)
  const questionChoicesInTree = questionsToTreeDataStructure(questions)

  const treeSelectedValues = questionChoicesToTreeValues(questionsChoices)

  return (
    <TreeSelect
      className="mt-2 w-100"
      multiple
      maxTagCount={2}
      treeCheckable
      treeData={questionChoicesInTree}
      placeholder="Select question choices"
      value={treeSelectedValues}
      onChange={handleOnChange}
    />
  )
}

export const questionsToTreeDataStructure = (
  questions: Record<number, BasePropertiesModel>,
): Array<TreeDataNode> => {
  if (Object.keys(questions).length === 0) {
    return []
  }

  const filteredQuestion = Object
    .values(questions)
    .filter(
      question => AVAILABLE_QUESTION_TYPES.includes(question.type),
    ) as Array<SideBySidePropertiesModel | MatrixTablePropertiesModel>

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
    const [selectedQuestionId, selectedChoiceId] = selectedNode.split(QUESTION_CHOICE_SEPERATOR)

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
  questionsChoices: Module['props']['questionsChoices'] = [],
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

const QuestionList = connector(QuestionListComponent)

export default QuestionList
