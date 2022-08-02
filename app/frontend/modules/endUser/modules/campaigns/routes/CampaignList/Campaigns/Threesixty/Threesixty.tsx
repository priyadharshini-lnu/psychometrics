import React from 'react'
import { Col } from 'antd'
import { Link } from 'react-router-dom'

export const Threesixty = ({ campaign }) => (
  <Col className="card" xs={24} sm={12} md={8} lg={6} xl={4}>
    <Link to={`/threesixty_campaigns/${campaign.id}`}>
      This is threesixty campaign
    </Link>
  </Col>
)
