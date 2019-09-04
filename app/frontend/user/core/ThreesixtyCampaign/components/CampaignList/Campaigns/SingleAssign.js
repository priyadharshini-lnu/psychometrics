/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable max-len */
import React, { useState } from 'react'
import {
  Row, Col, Icon, Card, Progress, Dropdown, Menu,
} from 'antd'
import { Link } from 'react-router-dom'
import './styles.scss'
import PrivacyModal from './PrivacyModal'
import mindmill from './mindmill.png'
import hogan from './hogan.png'

const IN_PROGRESS = 'in_progress'

const StatusMenu = reports => (
  <Menu>
    {reports.map(report => (
      <Menu.Item key={report.id}>
        <a href={`${report.pdfUrl}`} target="_blank">
          <Icon type="download" />
          {' '}
          {report.name}
        </a>
      </Menu.Item>
    ))}
  </Menu>
)

const renderButtonContent = ({
  mindmill, mindmillUrl, url, status, assignedReports, needConfirm,
}, setShowConfirm) => {
  let href = url
  if (mindmill) { href = mindmillUrl }

  const showPolicyConfirm = (e) => {
    e.preventDefault()
    if (needConfirm) {
      setShowConfirm(true)
    } else {
      location.href = href
    }
  }

  const LinkTag = ({ children }) => (mindmill
    ? <a href={href} onClick={showPolicyConfirm}>{children}</a>
    : <Link to={href} onClick={showPolicyConfirm}>{children}</Link>)


  if (status === IN_PROGRESS) {
    return (
      <LinkTag>
        <svg width="18px" height="17px" viewBox="0 0 18 17" version="1.1" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <polygon id="path-1" points="0 0 18 0 18 17 0 17" />
          </defs>
          <g id="Desktop" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
            <g id="Assesments-2_03" transform="translate(-619.000000, -512.000000)">
              <g id="Assessment-3" transform="translate(603.000000, 243.000000)">
                <g id="Group-3" transform="translate(16.000000, 269.000000)">
                  <mask id="mask-2" fill="white">
                    <use href="#path-1" />
                  </mask>
                  <g id="Clip-2" />
                  <path d="M11.1741028,0.25844231 C10.832161,0.609695211 10.8469477,1.16307574 11.2073728,1.49636174 L14.5399189,4.5749901 L2.4536633,4.5749901 C1.09883452,4.5749901 0,5.64222398 0,6.95919777 L0,14.612199 C0,15.9309694 1.10068286,17 2.4564358,17 L7.87390255,17 C8.35077271,17 8.73799867,16.6244918 8.73799867,16.1600474 L8.73799867,16.1366904 C8.73799867,15.6713477 8.34892437,15.2940428 7.87020588,15.2940428 L3.0747035,15.2940428 C2.34645993,15.2940428 1.75591724,14.7200004 1.75591724,14.0112061 L1.75591724,7.55749555 C1.75591724,6.85229472 2.34368743,6.28094729 3.06823433,6.28094729 L14.5990656,6.28094729 L11.1583919,9.58146687 C10.8182985,9.90846446 10.8146018,10.4420814 11.1509986,10.7735707 C11.4957129,11.1131451 12.0585306,11.1167385 12.4078657,10.7816558 L18,5.41584104 L12.3829132,0.22789858 C12.0400472,-0.0874205202 11.5003337,-0.073945345 11.1741028,0.25844231" id="Fill-1" fill="#01837F" mask="url(#mask-2)" />
                </g>
              </g>
            </g>
          </g>
        </svg>
        {' '}
        Continue
      </LinkTag>
    )
  }

  if (status === 'completed') {
    if (assignedReports.length > 1) {
      return (
        <Dropdown
          trigger={['click']}
          overlay={() => StatusMenu(assignedReports)}
        >
          <div>
            <Icon type="download" />
            {' '}
            Download Report
          </div>
        </Dropdown>
      )
    } if (assignedReports.length === 1) {
      return (
        <a href={`${assignedReports[0].pdfUrl}.pdf`} target="_blank">
          <Icon type="download" />
          {' '}
          Download Report
        </a>
      )
    }
    return (
      <a>
        <Icon type="check" />
        {' '}
        Completed
      </a>
    )
  }
  return (
    <a href={href} onClick={showPolicyConfirm}>
      <Icon type="play-circle" />
      {' '}
      Begin
    </a>
  )
}

export default function SingleAssign ({ campaign: assign, acceptPolicy }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const accept = () => {
    acceptPolicy().then(() => {
      location.href = assign.url
    })
  }
  return (
    <Col className="card" xs={24} sm={12} md={8} lg={6} xl={4}>
      <Link to={assign.status !== 'completed' ? assign.url : '#'}>
        <Card
          bodyStyle={{ padding: 0 }}
          hoverable
          cover={(
            <div className="cover">
              <div className="caption">
                <div className="icon">
                  <svg width="17px" height="21px" viewBox="0 0 17 21" version="1.1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink">
                    <defs />
                    <g id="Desktop" stroke="none" strokeWidth="1">
                      <g id="Assesments-2_03" transform="translate(-127.000000, -265.000000)">
                        <g id="Assessment-1" transform="translate(103.000000, 243.000000)">
                          <g id="Group-3" transform="translate(24.000000, 22.000000)">
                            <path d="M13.9908046,1.72759387 C13.6901243,-0.19956143 11.2870748,-0.645733286 10.397795,1.06132194 L0,21 L2.67182735,21 L11.8804598,3.34166108 L13.4412855,13.343418 L10.8316678,13.3417118 C10.8061459,13.3485366 10.7822191,13.3425649 10.7566972,13.3425649 C10.1369927,13.3425649 9.63532723,13.8800185 9.63532723,14.5420249 C9.63532723,15.2048845 10.1369927,15.7423381 10.7566972,15.7423381 C10.7822191,15.7423381 10.8061459,15.7363664 10.8316678,15.7346602 L13.8145437,15.7423381 L14.636031,21 L17,21 L13.9908046,1.72759387 Z" id="Fill-1" />
                          </g>
                        </g>
                      </g>
                    </g>
                  </svg>
                </div>
                <div className="title">Assesment</div>
              </div>
              {assign.mindmill && <img className="service" src={mindmill} alt="" />}
              {assign.hogan && <img className="service" src={hogan} alt="" />}
              <div className="card-progress">
                <Progress
                  percent={assign.completionPercent || 0}
                />
              </div>
            </div>
          )}
        >
          <div className="card-body">
            <div className="card-content">
              <div className="card-title">
                {assign.assessmentName}
              </div>
              <Row type="flex" className="info-line">
                <Col className="info-block">
                  <Icon type="clock-circle" />
                  {' '}
                  {assign.timing}
                </Col>
                <Col className="info-block">
                  <Icon type="question-circle" />
                  {' '}
                  {assign.questionsCount}
                </Col>
              </Row>
              <div className="divider" />
              <div className="button">
                {renderButtonContent(assign, setShowConfirm)}
              </div>
            </div>
          </div>
        </Card>
      </Link>
      {assign.needConfirm && <PrivacyModal accept={accept} show={showConfirm} close={() => setShowConfirm(false)} />}
    </Col>
  )
}
