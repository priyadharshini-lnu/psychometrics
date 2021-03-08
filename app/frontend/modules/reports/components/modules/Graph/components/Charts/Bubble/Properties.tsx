import React, { FC, useState } from 'react'
import {
  Collapse,
  Input,
  Row,
  Col,
  Typography,
  List,
  Button,
  Select,
} from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'

import I18nStore from 'modules/reports/store/I18nStore'

import styles from './styles.scss'

interface DataPoint {
  label: string
  x: number
  y: number
}

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model?: any
}

const Properties: FC<Props> = ({ model }) => {
  const [meanValues, setMeanValues] = useState({
    x: {
      title: model?.props?.xMeanTitle ?? '',
      value: model?.props?.xMeanValueId ?? 0,
    },
    y: {
      title: model?.props?.yMeanTitle ?? '',
      value: model?.props?.yMeanValueId ?? 0,
    },
  })

  const [dataPoints, setDataPoints] = useState<DataPoint[]>(
    model?.props?.seriesValueIds ?? [],
  )

  const updateChartProps = (
    field: string,
    value: string | number | DataPoint[],
  ) => {
    model.props[field] = value
    model.update()
  }

  const insertDataPointAt = (
    index: number,
    field: string,
    value: number | string | undefined,
  ): DataPoint[] => [
    ...dataPoints.slice(0, index),
    {
      ...dataPoints[index],
      [field]: value || 0,
    },
    ...dataPoints.slice(index + 1),
  ]

  const handleAddDatapointRow = () => {
    setDataPoints([
      ...dataPoints,
      {
        label: '',
        x: 0,
        y: 0,
      },
    ])
  }

  const handleRemoveDatapointRow = (index: number) => {
    const filteredDataPoints = dataPoints.filter(
      (_, currentIndex) => currentIndex !== index,
    )
    setDataPoints(filteredDataPoints)
    updateChartProps('seriesValueIds', filteredDataPoints)
  }

  const propertiesOptions = model.getSourceModel()

  return (
    <Collapse defaultActiveKey={[]}>
      <Collapse.Panel header="Mean factors" key="1">
        <Row>
          <Typography.Text strong>X mean</Typography.Text>
          <Col className="mb-4">
            <Input
              placeholder="Enter title"
              className="w-100"
              onChange={({ currentTarget: { value } }) => setMeanValues({
                ...meanValues,
                x: { title: value, value: meanValues.x.value },
              })
              }
              onBlur={() => updateChartProps('xMeanTitle', meanValues.x.title)}
              value={meanValues.x.title}
            />
          </Col>
          <Col className="mb-8" flex="1 1 0">
            <FactorsSelect
              propertiesOptions={propertiesOptions}
              placeholder="Select X value"
              onChange={(value) => {
                setMeanValues({
                  ...meanValues,
                  x: { value, title: meanValues.x.title },
                })
                updateChartProps('xMeanValueId', value)
              }}
              value={meanValues.x.value}
            />
          </Col>
        </Row>
        <Row>
          <Typography.Text strong>Y mean</Typography.Text>
          <Col className="mb-4">
            <Input
              placeholder="Enter title"
              className="w-100"
              onChange={({ currentTarget: { value } }) => setMeanValues({
                ...meanValues,
                y: { title: value, value: meanValues.y.value },
              })
              }
              onBlur={() => updateChartProps('yMeanTitle', meanValues.y.title)}
              value={meanValues.y.title}
            />
          </Col>
          <Col className="mb-8" flex="1 1 0">
            <FactorsSelect
              propertiesOptions={propertiesOptions}
              placeholder="Select Y value"
              onChange={(value) => {
                setMeanValues({
                  ...meanValues,
                  y: { value, title: meanValues.y.title },
                })
                updateChartProps('yMeanValueId', value)
              }}
              value={meanValues.y.value}
            />
          </Col>
        </Row>
      </Collapse.Panel>
      <Collapse.Panel header="Data points" key="2">
        <List
          className={styles.list}
          itemLayout="vertical"
          size="small"
          dataSource={dataPoints}
          renderItem={(dataPoint, index) => (
            <List.Item key={index}>
              <Row align="middle" justify="space-between" className="mb-2">
                <Col>
                  <Input
                    placeholder="Label"
                    className="w-100"
                    value={dataPoint.label}
                    onChange={({ currentTarget: { value } }) => setDataPoints(insertDataPointAt(index, 'label', value))
                    }
                    onBlur={() => updateChartProps('seriesValueIds', dataPoints)
                    }
                  />
                </Col>
              </Row>
              <Row className="mb-2">
                <Col flex="1 1 0">
                  <FactorsSelect
                    propertiesOptions={propertiesOptions}
                    placeholder="X value"
                    value={dataPoint.x}
                    onChange={(value) => {
                      const updatedDataPoints = insertDataPointAt(
                        index,
                        'x',
                        value,
                      )
                      setDataPoints(updatedDataPoints)
                      updateChartProps('seriesValueIds', updatedDataPoints)
                    }}
                  />
                </Col>
              </Row>
              <Row align="middle" justify="space-between" className="mb-2">
                <Col flex="1 1 0">
                  <FactorsSelect
                    propertiesOptions={propertiesOptions}
                    placeholder="Y value"
                    value={dataPoint.y}
                    onChange={(value) => {
                      const updatedDataPoints = insertDataPointAt(
                        index,
                        'y',
                        value,
                      )
                      setDataPoints(updatedDataPoints)
                      updateChartProps('seriesValueIds', updatedDataPoints)
                    }}
                  />
                </Col>
              </Row>
              <Row className="mb-2">
                <Button
                  className="w-100"
                  onClick={() => handleRemoveDatapointRow(index)}
                  type="danger"
                >
                  <DeleteOutlined />
                </Button>
              </Row>
            </List.Item>
          )}
          footer={(
            <Button className="w-100" onClick={handleAddDatapointRow}>
              <PlusOutlined />
            </Button>
)}
        />
      </Collapse.Panel>
    </Collapse>
  )
}

interface FactorsSelectProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  propertiesOptions: any
  onChange: (value: number) => void
  placeholder: string
  value: number
}

const FactorsSelect: FC<FactorsSelectProps> = ({
  propertiesOptions,
  onChange,
  placeholder,
  value,
}) => (
  <Select
    className="w-100"
    dropdownClassName="ps-2"
    showSearch
    filterOption={(searchInput, option) => option?.title?.toLowerCase()?.indexOf(searchInput.toLowerCase()) >= 0}
    onChange={onChange}
    placeholder={placeholder}
    value={value !== 0 ? value : undefined}
  >
    {propertiesOptions?.map(assessmentFactor => (
      <Select.Option
        value={assessmentFactor.id}
        title={assessmentFactor.name}
        key={propertiesOptions.id}
      >
        {I18nStore.tFactor(assessmentFactor, 'alias')}
      </Select.Option>
    )) ?? []}
  </Select>
)

export default Properties
