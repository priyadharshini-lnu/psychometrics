import React from 'react'
import { Menu } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import { Quiz, Widgets } from '@thetalententerprise/glint/icons'
import QuestionList from './QuestionList'
import BlockList from './BlockList'

const { I18n } = window

const QuestionCenter: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const activeKey = location.pathname.includes('blocks') ? 'blocks' : 'questions'

  const handleSelect = ({ key }: { key: string }) => {
    if (key === 'blocks') {
      navigate('/admin/templates/blocks')
    } else {
      navigate('/admin/templates/questions')
    }
  }

  const items = [
    {
      key: 'questions',
      icon: <Quiz />,
      label: I18n.t('admin.questions_title') || 'Questions',
    },
    {
      key: 'blocks',
      icon: <Widgets />,
      label: I18n.t('admin.blocks_title') || 'Blocks',
    },
  ]

  return (
    <div>
      <Menu
        mode="horizontal"
        selectedKeys={[activeKey]}
        onSelect={handleSelect}
        items={items}
      />
      {activeKey === 'questions' && <QuestionList />}
      {activeKey === 'blocks' && <BlockList />}
    </div>
  )
}

export default QuestionCenter
