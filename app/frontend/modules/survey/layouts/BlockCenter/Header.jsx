import { connect } from 'react-redux'
import NotificationDispatcher from '~/modules/survey/dispatchers/NotificationDispatcher'
import { save } from '~/modules/survey/core/builder/blockCenter'
import { selectBlock } from '~/modules/survey/core/builder/assessment/selectors'
import ActionsHistory from '~/modules/survey/components/ActionsHistory'
import styles from './Header.less'

const urldata = location.pathname.match(/blocks\/(\d+)/)
const id = urldata && urldata[1]

const Header = ({
  save, block, builder, saving,
}) => {
  const saveHandler = () => {
    save(block, builder).then(() => {
      NotificationDispatcher.notify({ message: 'Block successfully saved' })
    }).catch(() => {
      NotificationDispatcher.notify({ level: 'error', message: 'Something went wrong. Contact your administrator.' })
    })
  }

  return (
    <div className={`panel-heading ${styles.menu}`}>
      <div>
        <a href={`/administration/templates/blocks/${id}/preview`} className={`btn btn-default ${styles.preview}`}>
          <span className="fa fa-search" />
          Preview Block
        </a>
      </div>
      <ul className="panel-controls">
        <li>
          <button onClick={saveHandler} disabled={saving} className={`btn btn-success ${styles.saveButton}`}>
            <i className="fa fa-save" />
            Save Block
          </button>
        </li>
        <li><ActionsHistory /></li>
      </ul>
    </div>
  )
}

export default connect(
  ({ survey }) => ({
    builder: survey.builder,
    block: selectBlock(survey.builder, survey.builder.assessment.id),
    saving: survey.builder.blockCenter.saving,
  }),
  {
    save,
  },
)(Header)
