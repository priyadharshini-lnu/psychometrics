import { Page } from '@playwright/test'

export default class CampaignPage {
  private page: Page

  constructor(page: Page) {
    this.page = page
  }

  async addCampaign(name: string, startDate: string, endDate: string): Promise<void> {
    await this.page.getByRole('button', { name: 'plus Add Campaign down' }).click()
    await this.page.getByText('Add Normal Campaign').click()
    await this.page.getByRole('textbox', { name: '* Name :' }).click()
    await this.page.getByRole('textbox', { name: '* Name :' }).fill(name)
    await this.page.getByRole('textbox', { name: 'Start Date :' }).click()
    await this.page.getByRole('cell', { name: startDate }).locator('div').click()
    await this.page.getByRole('button', { name: 'OK' }).click()
    await this.page.getByRole('textbox', { name: 'End Date :' }).click()
    await this.page.locator('div:nth-child(14) > .ant-picker-dropdown > .ant-picker-panel-container > .ant-picker-panel-layout > .ant-picker-panel > .ant-picker-datetime-panel > .ant-picker-date-panel > .ant-picker-header > .ant-picker-header-super-next-btn').click()
    await this.page.getByRole('cell', { name: endDate }).locator('div').click()
    await this.page.getByRole('button', { name: 'OK' }).click()
    await this.page.getByRole('button', { name: 'check Add' }).click()
  }

  async selectCampaign(campaignName: string): Promise<void> {
    await this.page.click(`role=link[name="${campaignName}"]`)
  }
}
