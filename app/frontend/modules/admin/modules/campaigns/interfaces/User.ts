export default interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  active: boolean
  role: string
  grants: object
  permissions: {
    edit: boolean
    loginAs: boolean
    resetPassword: boolean
    remove: boolean
  }
}
