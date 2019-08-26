const userPresenter = {
  getFullName ({ firstName, lastName }) {
    if (lastName && firstName) return `${firstName} ${lastName}`
    return firstName || lastName
  },
  getFullNameWithEmail (user) {
    const fullName = this.getFullName(user)
    if (fullName) return `${fullName} (${user.email})`

    return user.email
  },
  selfUserName (item, user = item.user) {
    return item.isSelf ? I18n.t('threesixty.yourself') : this.getFullName(user)
  },
}

export default userPresenter
