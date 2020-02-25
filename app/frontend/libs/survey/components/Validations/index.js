import Validations from './Validations'
import RequiredValidations from './RequiredValidations'
import connect from './connect'

export default connect(Validations)

export {
  RequiredValidations,
}
