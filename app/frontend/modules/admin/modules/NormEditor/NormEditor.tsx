import React from 'react'
import connect, { PropsFromRedux } from './connect'
import EditableTable from './NormFactors/EditableTable'
import styles from './styles.scss'
import { OwnProps, Factor } from './interfaces'

const NormEditor: React.FC<OwnProps & PropsFromRedux> = ({
  factors, saveNorm,
}) => {
  const prepareFactors = (factors: Factor[]) => factors.map((factor) => {
    const values = factor.factors_norms_props[0] || {}
    const { mean = null, standard_deviation = null } = values

    return {
      key: `${factor.id}`,
      name: factor.name,
      mean,
      standard_deviation,
    }
  })

  return (
    <div className={styles.normEditor}>
      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title">Norm Editor</h3>
        </div>
        <div className="panel-body">
          <EditableTable factors={prepareFactors(factors)} onSave={saveNorm} />
        </div>
      </div>
    </div>
  )
}

export default connect(NormEditor)
