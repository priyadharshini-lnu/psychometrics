import { useNavigate } from 'react-router-dom'
import { Pagination as AntPagination } from 'antd'
import routeUtils from '~/utils/route'
import styles from './styles.less'
import settings from '../../settings'

function Pagination ({
  total, path, onChange,
}) {
  const navigate = useNavigate()
  const handleOnChange = (page) => {
    onChange && onChange(page)
    routeUtils.moveTo(navigate, settings.urlPrefix, `${path}?page=${page}`)
  }

  return (
    <div className={styles.container}>
      <AntPagination
        current={routeUtils.getPage()}
        pageSize={settings.pageLimit}
        total={total}
        onChange={handleOnChange}
        showSizeChanger={false}
        hideOnSinglePage
      />
    </div>
  )
}

export default Pagination
