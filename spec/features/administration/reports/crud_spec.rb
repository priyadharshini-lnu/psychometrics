# frozen_string_literal: true

require 'rails_helper'
include Features::Helpers::Reports

feature 'CRUD Report' do
  given!(:dimension) { create :assessment, name: 'Some Assessment' }
  given!(:report_family) { create :report_family, name: 'Some Report Family' }
  before { enter_as :superadmin }

  scenario 'Create Report' do
    create_report(name: 'My report', assessment_name: 'Some Assessment', report_family_name: 'Some Report Family')
    expect(page).to have_content t('administration.reports.create.successfully', name: 'My report')
    expect(page).to have_css('#reports_list td', text: 'My report')
  end

  context 'Update, Destroy' do
    given!(:membership) { create(:membership) }
    given!(:report) { create(:report, name: 'My report') }
    given!(:assign) { create(:assign, membership: membership) }
    given!(:license) do
      create(:license, client: membership.client.root, used_number: 0, report_family: report.report_families.take)
    end

    before { visit '/administration/reports' }

    scenario 'Edit Report' do
      find("#report_#{report.id} .edit").click
      find('.modal-header').click

      fill_in 'resource_name', with: 'My updated report'
      click_on 'Update'
      expect(page).to have_content t('administration.reports.update.successfully', name: 'My updated report')
      expect(page).to have_css('#reports_list td', text: 'My updated report')
    end

    scenario 'there are not any assigns for this report' do
      find("#report_#{report.id} .edit").click
      find('.modal-header').click
      expect(page.all('#resource_assessment_ids option:disabled', visible: false).empty?).to be_truthy
    end

    scenario 'there are assigns for this report' do
      create(:assigns_report, report: report, assign: assign)
      find("#report_#{report.id} .edit").click
      find('.modal-header').click
      expect(!page.all('#resource_assessment_ids option:disabled', visible: false).empty?).to be_truthy
    end

    scenario 'Destroy Report' do
      find("#report_#{report.id} .delete").click
      find(:button, text: 'Yes').click
      expect(page).to have_content t('administration.reports.destroy.successfully', name: 'My report')
      expect(page).to have_no_css('#reports_list td', text: 'My report')
    end
  end
end
