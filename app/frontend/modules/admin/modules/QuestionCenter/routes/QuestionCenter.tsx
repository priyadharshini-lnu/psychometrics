import React from 'react'
import { Menu } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  QuestionCircleOutlined,
  BlockOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
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
      icon: <QuestionCircleOutlined />,
      label: I18n.t('admin.questions_title') || 'Questions',
    },
    {
      key: 'blocks',
      icon: <BlockOutlined />,
      label: I18n.t('admin.blocks_title') || 'Blocks',
    },
  ]

  return (
    <div>
      <Breadcrumb
        crumbs={[
          {
            link: () => '/admin',
            label: () => I18n.t('assessments.dashboard'),
          },
          {
            label: () => (activeKey === 'questions' ? (I18n.t('admin.questions_title'))
              : (I18n.t('admin.blocks_title'))
            ),
          },
        ]}
      />
      <Menu
        mode="horizontal"
        selectedKeys={[activeKey]}
        onSelect={handleSelect}
        items={items}
        style={{ marginBottom: 20 }}
      />
      {activeKey === 'questions' && <QuestionList />}
      {activeKey === 'blocks' && <BlockList />}
    </div>
  )
}

export default QuestionCenter
