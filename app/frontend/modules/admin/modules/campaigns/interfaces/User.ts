export default interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  active: boolean
  role: string
  grants: object
}
