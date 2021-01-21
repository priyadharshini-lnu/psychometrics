import React from 'react'
import {
  Col,
} from 'antd'


export default function AssessmentCard ({
  size, children, withSidebar,
}) {
  let cols = withSidebar ? 8 : 6
  if (size <= 2) {
    cols = size === 1 ? 24 : 12
  }
  return (
    <Col className="card" xs={24} sm={cols} md={cols} lg={cols} xl={cols}>
      {children}
    </Col>
  )
}
