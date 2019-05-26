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
  selfUserName (item) {
    return item.isSelf ? 'Yourself' : this.getFullNameWithEmail(item.user)
  },
}

export default userPresenter
