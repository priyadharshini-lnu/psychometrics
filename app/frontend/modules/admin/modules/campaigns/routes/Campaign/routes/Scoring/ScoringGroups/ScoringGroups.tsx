import { useState } from 'react'
import {
  Row, Col, Space, Button, Typography, Dropdown,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { AddGroupForm } from './AddGroupForm'

export const ScoringGroups = () => {
  const [addGroup, setAddGroup] = useState(false)
  return (
    <div>
      <Row
        justify="space-between"
        align="middle"
        className="pt-4 pb-4 ps-4 pe-4"
      >
        <Col>
          <Typography.Title level={3}>
            Scoring
          </Typography.Title>
        </Col>
        <Col>
          <Space>
            <Dropdown menu={{ items: [] }}>
              <Button>Menu</Button>
            </Dropdown>
            <Button
              type="primary"
              onClick={() => setAddGroup(true)}
            >
              <PlusOutlined />
              Add Group
            </Button>
          </Space>
          <AddGroupForm open={addGroup} onClose={() => setAddGroup(false)} />
        </Col>
      </Row>

    </div>
  )
}
