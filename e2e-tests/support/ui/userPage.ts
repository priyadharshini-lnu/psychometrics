import { Page } from '@playwright/test'

export default class UserPage {
  private page: Page

  constructor(page: Page) {
    this.page = page
  }

  async addUser(firstName: string, lastName: string, email: string, locale: string): Promise<void> {
    await this.page.click('role=button[name="plus Add User"]')
    await this.page.getByLabel('First name').click()
    await this.page.getByLabel('First name').fill(firstName)
    await this.page.getByLabel('First name').press('Tab')
    await this.page.getByLabel('Last name').fill(lastName)
    await this.page.getByLabel('Last name').press('Tab')
    await this.page.getByRole('textbox', { name: '* Email :' }).fill(email)
    await this.page.getByRole('textbox', { name: '* Email :' }).press('Tab')
    await this.page.getByLabel('Locale').fill(locale)
    await this.page.click('role=button[name="check Add"]')
  }
}
