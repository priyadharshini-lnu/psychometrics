import DataSource from '~/modules/reports/components/DataSourceMenu'

const ResultText = ({ modules, update }) => {
  const onSelect = () => {
    update()
  }

  return (
    <div>
      <DataSource modules={modules} onSelect={onSelect} singleChoice />
    </div>
  )
}

export default ResultText
