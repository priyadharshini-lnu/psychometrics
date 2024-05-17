import { Page } from '@playwright/test'

export default class ClientPage {
  private page: Page

  constructor(page: Page) {
    this.page = page
  }

  async createClient(name: string, type: string, number: string, country: string, year: string, projectManager: string): Promise<void> {
    await this.page.getByRole('button', { name: 'plus Create Client' }).click()
    await this.page.getByRole('textbox', { name: '* Name :' }).click()
    await this.page.getByRole('textbox', { name: '* Name :' }).fill(name)
    await this.page.getByLabel('Type').click()
    await this.page.getByText(type, { exact: true }).click()
    await this.page.getByLabel('Number').click()
    await this.page.getByLabel('Number').fill(number)
    await this.page.getByLabel('Country').click()
    await this.page.getByLabel('Country').fill(country)
    await this.page.getByTitle(country, { exact: true }).locator('div').click()
    await this.page.getByRole('combobox', { name: '* Year :' }).click()
    await this.page.getByTitle(year).locator('div').click()
    await this.page.getByLabel('Project Manager').click()
    await this.page.getByLabel('Project Manager').fill(projectManager.substring(0, 1))
    await this.page.getByText(projectManager).click()
    await this.page.getByRole('button', { name: 'check Add' }).click()
  }

  async selectClient(clientName: string): Promise<void> {
    await this.page.getByRole('link', { name: clientName }).click()
  }
}
