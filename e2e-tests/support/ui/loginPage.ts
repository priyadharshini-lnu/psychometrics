import { Page } from '@playwright/test'

export default class LoginPage {
  private page: Page

  constructor(page: Page) {
    this.page = page
  }

  async login(email: string, password: string): Promise<void> {
    await this.page.goto('/')
    await this.page.fill('input[placeholder="Enter Email Address"]', email)
    await this.page.fill('input[placeholder="Enter Password"]', password)
    await this.page.click('role=button[name="Login right"]')
  }
}
