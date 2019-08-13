/* eslint-disable max-len */
import React from 'react'
import {
  Row, Col, Icon, Card, Progress,
} from 'antd'
import { Link } from 'react-router-dom'
import './styles.scss'
import mindmill from './mindmill.png'
import hogan from './hogan.png'

const COLORS = ['#dcf5ef', '#95e8d7', '#69dbc8', '#42cfbc', '#1fc2b2']

export default function Threesixty ({ campaign, color }) {
  return (
    <Col className="card">
      <Link to={`/campaigns/${campaign.id}`}>
        <Card
          bodyStyle={{ padding: 0 }}
          hoverable
          cover={(
            <div className="cover threesixty">
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
                <div className="title">360 Assesment</div>
              </div>
              {campaign.mindmill && <img className="service" src={mindmill} alt="" />}
              {campaign.hogan && <img className="service" src={hogan} alt="" />}
              <div className="card-progress">
                <Progress percent={30} strokeColor={COLORS[color]} />
              </div>
            </div>
          )}
        >
          <div className="card-body">
            <div className="card-content">
              <div className="card-title">
                {campaign.assessmentName}
              </div>
              <Row type="flex" className="info-line">
                <Col className="info-block">
                  <Icon type="clock-circle" />
                  {' '}
                  {campaign.timing}
                </Col>
                <Col className="info-block">
                  <Icon type="question-circle" />
                  {' '}
                  {campaign.questionsCount}
                </Col>
              </Row>
              <div className="divider" />
              <div className="button">
                <svg width="17px" height="17px" viewBox="0 0 17 17" version="1.1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink">
                  <defs>
                    <polygon id="path-1" points="0 0.8341 17 0.8341 17 3 0 3" />
                  </defs>
                  <g id="Desktop" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                    <g id="Assesments-2_03" transform="translate(-868.000000, -510.000000)">
                      <g id="Assessment-4" transform="translate(853.000000, 243.000000)">
                        <g id="Group-10" transform="translate(15.000000, 267.000000)">
                          <g id="Group-3" transform="translate(0.000000, 14.000000)">
                            <mask id="mask-2" fill="white">
                              <use href="#path-1" />
                            </mask>
                            <g id="Clip-2" />
                            <path d="M15.917,3.0001 L1.083,3.0001 C0.485,3.0001 0,2.5151 0,1.9171 C0,1.3191 0.485,0.8341 1.083,0.8341 L15.917,0.8341 C16.515,0.8341 17,1.3191 17,1.9171 C17,2.5151 16.515,3.0001 15.917,3.0001" id="Fill-1" fill="#01837F" mask="url(#mask-2)" />
                          </g>
                          <path d="M7.1312316,2 C6.50659956,2 6,1.5521699 6,1 C6,0.447830102 6.50659956,0 7.1312316,0 L15.8687684,0 C16.4934004,0 17,0.447830102 17,1 C17,1.5521699 16.4934004,2 15.8687684,2 L7.1312316,2 Z" id="Fill-4" fill="#01837F" />
                          <path d="M15.8687684,9 L7.1312316,9 C6.50659956,9 6,8.5521699 6,8 C6,7.4478301 6.50659956,7 7.1312316,7 L15.8687684,7 C16.4934004,7 17,7.4478301 17,8 C17,8.5521699 16.4934004,9 15.8687684,9" id="Fill-6" fill="#01837F" />
                          <path d="M1,9 C0.447830102,9 0,8.53950839 0,7.97172698 L0,1.02827302 C0,0.459542146 0.447830102,0 1,0 C1.55309326,0 2,0.459542146 2,1.02827302 L2,7.97172698 C2,8.53950839 1.55309326,9 1,9" id="Fill-8" fill="#01837F" />
                        </g>
                      </g>
                    </g>
                  </g>
                </svg>
                {' '}
                <span className="card-detail-txt mls">Details</span>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </Col>
  )
}
