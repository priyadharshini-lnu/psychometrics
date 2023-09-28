import { FC, useState } from 'react'
import {
  Collapse,
  Input,
  Row,
  Col,
  Typography,
  List,
  Button,
  Select,
  InputNumber,
} from 'antd'
import { connect } from 'react-redux'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'

import { PropertiesModel } from '~/modules/reports/interfaces/graphs/Bubble'

import { getAssessmentFactors } from '~/modules/reports/core/builder/selectors'
import I18nStore from '~/modules/reports/store/I18nStore'
import { RootState } from '~/modules/reports/core/rootReducers'

import styles from './styles.less'

interface DataPoint {
  label: string
  x: number
  y: number
}

type AssessmentFactor = {
  id: string
  name: string
}

interface Props {
  model: PropertiesModel
  factors: AssessmentFactor[]
}

const Properties: FC<Props> = ({ model, factors }) => {
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
      [field]: value,
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

  return (
    <Collapse defaultActiveKey={[]} className={styles.properties} key={model.id}>
      <Collapse.Panel header="Chart" key="1">
        <Row justify="space-between">
          <Col className="mb-4">
            <Typography.Text strong>Size</Typography.Text>
          </Col>
          <Col className="mb-4">
            <InputNumber
              onBlur={({ currentTarget: { value } }) => updateChartProps('bubbleSize', parseFloat(value))}
              defaultValue={model.props.bubbleSize}
              size="small"
            />
          </Col>
        </Row>
        <Row justify="space-between">
          <Col className="mb-4">
            <Typography.Text strong>Min X</Typography.Text>
          </Col>
          <Col className="mb-4">
            <InputNumber
              onBlur={({ currentTarget: { value } }) => updateChartProps('xMin', parseFloat(value))}
              defaultValue={model.props.xMin}
              size="small"
            />
          </Col>
        </Row>
        <Row justify="space-between">
          <Col className="mb-4">
            <Typography.Text strong>Max X</Typography.Text>
          </Col>
          <Col className="mb-4">
            <InputNumber
              onBlur={({ currentTarget: { value } }) => updateChartProps('xMax', parseFloat(value))}
              defaultValue={model.props.xMax}
              size="small"
            />
          </Col>
        </Row>
        <Row justify="space-between">
          <Col className="mb-4">
            <Typography.Text strong>Min Y</Typography.Text>
          </Col>
          <Col className="mb-4">
            <InputNumber
              onBlur={({ currentTarget: { value } }) => updateChartProps('yMin', parseFloat(value))}
              defaultValue={model.props.yMin}
              size="small"
            />
          </Col>
        </Row>
        <Row justify="space-between">
          <Col className="mb-4">
            <Typography.Text strong>Max Y</Typography.Text>
          </Col>
          <Col className="mb-4">
            <InputNumber
              onBlur={({ currentTarget: { value } }) => updateChartProps('yMax', parseFloat(value))}
              defaultValue={model.props.yMax}
              size="small"
            />
          </Col>
        </Row>
      </Collapse.Panel>
      <Collapse.Panel header="Mean factors" key="2">
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
              size="small"
            />
          </Col>
          <Col className="mb-8" flex="1 1 0">
            <FactorsSelect
              propertiesOptions={factors}
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
              size="small"
            />
          </Col>
          <Col className="mb-8" flex="1 1 0">
            <FactorsSelect
              propertiesOptions={factors}
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
      <Collapse.Panel header="Data points" key="3">
        <List
          className={styles.list}
          itemLayout="vertical"
          size="small"
          dataSource={dataPoints}
          renderItem={(dataPoint, index) => (
            <List.Item key={index}>
              <Row align="middle" justify="space-between" className="mb-2">
                <Col flex="1 1 0">
                  <Input
                    placeholder="Label"
                    className="w-100"
                    defaultValue={dataPoint.label}
                    onChange={({ currentTarget: { value } }) => setDataPoints(insertDataPointAt(index, 'label', value))
                    }
                    onBlur={() => updateChartProps('seriesValueIds', dataPoints)
                    }
                    size="small"
                  />
                </Col>
              </Row>
              <Row className="mb-2">
                <Col flex="1 1 0">
                  <FactorsSelect
                    propertiesOptions={factors}
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
                    propertiesOptions={factors}
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
                <Col flex="1 1 0">
                  <Button
                    className="w-100"
                    onClick={() => handleRemoveDatapointRow(index)}
                    danger
                    size="small"
                  >
                    <DeleteOutlined />
                  </Button>
                </Col>
              </Row>
            </List.Item>
          )}
          footer={(
            <Button className="w-100" onClick={handleAddDatapointRow} size="small">
              <PlusOutlined />
            </Button>
)}
        />
      </Collapse.Panel>
    </Collapse>
  )
}

interface FactorsSelectProps {
  propertiesOptions: AssessmentFactor[]
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
    size="small"
  >
    {propertiesOptions?.map(assessmentFactor => (
      <Select.Option
        value={assessmentFactor.id}
        title={assessmentFactor.name}
        key={assessmentFactor.id}
      >
        {I18nStore.tFactor(assessmentFactor, 'alias')}
      </Select.Option>
    )) ?? []}
  </Select>
)

export default connect((state: RootState, props: Props) => ({
  factors: getAssessmentFactors(state, props.model.assessment_id),
}), {})(Properties)
