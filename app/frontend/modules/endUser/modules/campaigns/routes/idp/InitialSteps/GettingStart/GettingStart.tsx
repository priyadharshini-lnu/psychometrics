import { ButtonWithArrow, BoxWithShadow } from '~/glint'
import styles from './GettingStart.less'

export const GettingStart = ({ next }) => (
  <>
    <BoxWithShadow style={{ height: 200, marginTop: 24 }} />
    <div className={styles.footer}>
      <ButtonWithArrow label="Continue" size="small" type="primary" onClick={() => next()} />
    </div>
  </>
)
