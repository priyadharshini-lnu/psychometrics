import { Page } from '@playwright/test'

export default class ProjectPage {
  private page: Page

  constructor(page: Page) {
    this.page = page
  }

  async addProject(name: string, subdomain: string, projectNumber: string): Promise<void> {
    await this.page.click('role=button[name="plus Add Project"]')
    await this.page.getByLabel('Name').click()
    await this.page.getByLabel('Name').fill(name)
    await this.page.getByLabel('Subdomain').click()
    await this.page.getByLabel('Subdomain').fill(subdomain)
    await this.page.getByRole('textbox', { name: '* Project Number :' }).click()
    await this.page.getByRole('textbox', { name: '* Project Number :' }).fill(projectNumber)
    await this.page.click('role=button[name="check Add"]')
  }

  async selectProject(projectName: string): Promise<void> {
    await this.page.click(`role=link[name="${projectName}"]`)
  }
}
