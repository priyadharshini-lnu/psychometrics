import { test, expect } from '@playwright/test'
import LoginPage from '@e2e-support/ui/loginPage'
import ClientPage from '@e2e-support/ui/clientPage'
import ProjectPage from '@e2e-support/ui/projectPage'
import CampaignPage from '@e2e-support/ui/campaignPage'
import UserPage from '@e2e-support/ui/userPage'
import config from '@e2e-test.config'

test('Create client, add project and then add campaign and user in that campaign', async ({ page }) => {
  const loginPage = new LoginPage(page)
  const clientPage = new ClientPage(page)
  const projectPage = new ProjectPage(page)
  const campaignPage = new CampaignPage(page)
  const userPage = new UserPage(page)

  await loginPage.login(config.superAdminEmail, config.superAdminPassword)
  
  await clientPage.createClient('Apollo', 'TTE', '200', 'India', '2024', `Jon Snow (${config.superAdminEmail})`)
  await clientPage.selectClient('Apollo')
  
  await projectPage.addProject('books', 'apollotyres12', '200')
  await projectPage.selectProject('books')
  
  await campaignPage.addCampaign('Tyre know how', '16', '15')
  await campaignPage.selectCampaign('Tyre know how')
  
  await userPage.addUser('June', 'Summers', 'june.summers@random.com', 'en')
  
  await expect(page.getByRole('cell', { name: 'June Summers' })).toBeVisible()
})
