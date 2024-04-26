import Foundation from '~/modules/reports/components/Foundation'
import styles from './Error.less'

const Text = (props) => {
  const { preview, module } = props
  return (
    <Foundation {...props} error>
      <div className={`${styles.error} p-2`}>
        <p>
          {preview
            ? I18n.t('errors.module_error')
            : (
              <>
                <p>
                  {module.type}
                  #
                  {module.id}
                </p>
                <p>{I18n.t('errors.module_error_editor')}</p>
              </>
            ) }
        </p>
      </div>
    </Foundation>
  )
}

export default Text
