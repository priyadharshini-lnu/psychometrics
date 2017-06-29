require 'rails_helper'
include Features::Helpers::Assessments

feature 'CRUD Assessment' do
  given!(:dimension) { create :dimension, name: 'Agile' }
  before { enter_as :superadmin }

  scenario 'Create Assessment' do
    create_assessment(name: 'My assessment', dimension_name: 'Agile')
    expect(page).to have_content t('administration.assessments.create.successfully', name: 'My assessment')
    expect(page).to have_css('#assessments_list td a', text: 'My assessment')
  end

  context 'Update, Destroy' do
    given!(:assessment) { create(:assessment, name: 'My assessment') }

    scenario 'Edit Assessment' do
      visit '/administration/assessments'
      find("#assessment_#{assessment.id} .edit").click
      fill_in 'resource_name', with: 'My updated assessment'
      click_button 'Update'
      wait_for_ajax
      expect(page).to have_content t('administration.assessments.update.successfully', name: 'My updated assessment')
      expect(page).to have_css('#assessments_list td a', text: 'My updated assessment')
    end

    scenario 'Destroy Assessment' do
      visit '/administration/assessments'
      find("#assessment_#{assessment.id} .delete").click
      find(:button, text: 'Yes').click
      expect(page).to have_content t('administration.assessments.destroy.successfully', name: 'My assessment')
      expect(page).to have_no_css('#assessments_list td a', text: 'My assessment')
    end
  end
end
