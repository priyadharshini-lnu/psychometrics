import {
  Typography,
  Tree,
  Checkbox,
} from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { Question } from './AdvancedSettingsForm'
import styles from './ThreesixtyCampaignFormModal.less'

const { I18n } = window

const MATRIX_TABLE = 'MatrixTable'

type Props = {
  questions: Question[],
  onSelect: (selectedQuestions) => void
}

type TransformedQuestion = {
  id: number;
  selected_choice_indexes?: number[];
}

type QuestionTree = {
  title: string;
  key: string;
  children?: {
    title: string;
    key: string;
  }[];
}

const QuestionList = ({ questions, onSelect }: Props) => {
  const [expandedKeys, setExpandedKeys] = useState<string[]>([])
  const [checkedQuestions, setCheckedQuestions] = useState<string[]>([])
  const [questionsData, setQuestionsData] = useState<QuestionTree[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [questionMap, setQuestionMap] = useState(new Map<string, Question & {choices: number[]}>())

  const generateQuestionTree = useCallback((questions: Question[]) => {
    const newQuestionsAndChoicesMap = new Map<string, Question & {choices: number[]}>()
    const newExpandedKeys: string[] = []
    const newAlQuestionsAndChoices = new Set<string>()
    if (questions) {
      const data: QuestionTree[] = questions.map((item) => {
        const choices = new Set<number>()
        const { id } = item
        const childrenMap = new Map<string, {title: string, key: string}>()

        if (MATRIX_TABLE === item.type) {
          item.factors.forEach((factor) => {
            factor.props.forEach((prop) => {
              choices.add(prop.choice)
              const key = `${id}_${prop.choice}`
              newAlQuestionsAndChoices.add(key)
              childrenMap.set(key, {
                title: item.props.choicesTexts[prop.choice],
                key,
              })
            })
          })
        }

        newQuestionsAndChoicesMap.set(id, { ...item, choices: Array.from(choices) })
        newExpandedKeys.push(id)
        newAlQuestionsAndChoices.add(id)
        return {
          title: item.name,
          key: id,
          children: Array.from(childrenMap.values()).sort((a, b) => a.key.localeCompare(b.key)),
        }
      })
      setQuestionMap(newQuestionsAndChoicesMap)
      setExpandedKeys(newExpandedKeys)
      setQuestionsData(data)
    }
    if (checkedQuestions.length > 0) {
      const newCheckedQuestions = checkedQuestions.filter(key => newAlQuestionsAndChoices.has(key))
      handleCheck(newCheckedQuestions)
    }
  }, [checkedQuestions])

  useEffect(() => {
    generateQuestionTree(questions)
  }, [questions])

  const handleSelectAll = (e) => {
    const checkedKeys = e.target.checked ? questions.map(item => item.id) : []
    handleCheck(checkedKeys)
    setSelectAll(e.target.checked)
  }

  const handleCheck = (checkedKeys) => {
    const selectedQuestionsAndChocies = transformCheckedKeysToSelectedQuestionsAndChoices(checkedKeys, questionMap)
    onSelect(selectedQuestionsAndChocies)
    setCheckedQuestions(checkedKeys)
    setSelectAll(false)
  }

  const handleExpand = (expandedKeys: string[]) => {
    setExpandedKeys(expandedKeys)
  }

  return (
    <div className={styles.questionList}>
      <Typography.Title level={4}>
        {I18n.t('admin.threesixity_questions_title')}
      </Typography.Title>
      <Typography.Paragraph>
        {I18n.t('admin.threesixity_questions_title')}
      </Typography.Paragraph>
      {questionsData ? (
        <>
          <Typography.Paragraph>
            <Checkbox checked={selectAll} onChange={handleSelectAll}>
              {I18n.t('admin.threesixity_questions_select_all')}
            </Checkbox>
          </Typography.Paragraph>
          <Tree
            checkable
            expandedKeys={expandedKeys}
            checkedKeys={checkedQuestions}
            treeData={questionsData}
            onCheck={handleCheck}
            onExpand={handleExpand}
          />
        </>
      ) : null}
    </div>
  )
}

export default QuestionList

const transformCheckedKeysToSelectedQuestionsAndChoices = (
  checkedKeys: string[],
  questionMap: Map<string, Question & {choices: number[]}>,
): TransformedQuestion[] => {
  const selectedQuestionAndChoicesMap = new Map<number, TransformedQuestion>()

  // this set contains questions, if question is selected by clicking question checkbox
  const selectedQuestionMap = new Set<number>()
  checkedKeys.forEach((key) => {
    const [_question_id, choiceIndex] = `${key}`.split('_')
    const question_id = parseInt(_question_id, 10)
    if (!choiceIndex) {
      selectedQuestionMap.add(question_id)
    }
    if (!selectedQuestionAndChoicesMap[question_id]) {
      selectedQuestionAndChoicesMap[question_id] = { id: question_id, selected_choice_indexes: [] }
    }

    const question = questionMap.get(`${question_id}`)

    if (question?.type === MATRIX_TABLE) {
      if (selectedQuestionMap.has(question_id)) {
        selectedQuestionAndChoicesMap[question_id].selected_choice_indexes = question.choices
      } else {
        const parsedChoiceIndex = choiceIndex ? parseInt(choiceIndex, 10) : null
        selectedQuestionAndChoicesMap[question_id].selected_choice_indexes.push(parsedChoiceIndex)
      }
    }
  })

  return Object.values(selectedQuestionAndChoicesMap)
}
