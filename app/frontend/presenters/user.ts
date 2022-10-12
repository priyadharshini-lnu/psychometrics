interface User {
  email: string
  firstName: string
  lastName: string
}

const { I18n } = window

const userPresenter = {
  getFullName ({ firstName, lastName }: { firstName: string | null, lastName: string | null }) {
    if (lastName && firstName) return `${firstName} ${lastName}`
    return firstName || lastName
  },
  getFullNameWithEmail (user: User) {
    const fullName = this.getFullName(user)
    if (fullName) return `${fullName} (${user.email})`

    return user.email
  },
  selfUserName (item: { isSelf: boolean, user: User }, user = item.user) {
    return item.isSelf ? I18n.t('threesixty.yourself') : this.getFullName(user)
  },
}

export default userPresenter
