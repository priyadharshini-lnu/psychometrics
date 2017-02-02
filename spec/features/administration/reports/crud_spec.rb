require 'rails_helper'

feature 'CRUD Report' do
  given!(:dimension) { create :assessment, name: 'Some Assessment' }
  before { logged_in_as :superadmin }

  scenario 'Create Report' do
    create_report(name: 'My report', assessment_name: 'Some Assessment')
    expect(page).to have_content t('administration.reports.create.successfully', name: 'My report')
    expect(page).to have_css('#reports_list td', text: 'My report')
  end

  context 'Update, Destroy' do
    given!(:report) { create(:report, name: 'My report') }
    before { visit '/administration/reports' }

    scenario 'Edit Report' do
      find("#report_#{report.id} .edit").click
      fill_in 'resource_name', with: 'My updated report'
      click_on 'Update'
      expect(page).to have_content t('administration.reports.update.successfully', name: 'My updated report')
      expect(page).to have_css('#reports_list td', text: 'My updated report')
    end

    scenario 'Destroy Report' do
      find("#report_#{report.id} .delete").click
      find(:button, text: 'Yes').click
      expect(page).to have_content t('administration.reports.destroy.successfully', name: 'My report')
      expect(page).to have_no_css('#reports_list td', text: 'My report')
    end
  end
end
