require 'rails_helper'
include Features::Helpers::Assessments

feature 'CRUD Assessment' do
  given!(:dimension) { create :dimension, name: 'Agile' }
  before { enter_as :superadmin }

  scenario 'When open Assessment\'s form
            Then should see Type dropdown' do
    visit '/administration/assessments'
    click_link(t('administration.assessments.index.new'), href: '/administration/assessments/new')
    within '#assessments_form' do
      expect(page).to have_select('resource_type', visible: false)
    end
  end

  scenario 'When change type of Assessment to Mindmill
            Then should not see fields for Common type
            And should see fields for Mindmill type' do
    visit '/administration/assessments'
    click_link(t('administration.assessments.index.new'), href: '/administration/assessments/new')
    within '#assessments_form' do
      expect(page).not_to have_select('resource_mindmill_id', visible: false)
      select t('activerecord.attributes.assessment.types.mindmill'), from: 'resource_type', visible: false

      expect(page).not_to have_select('resource_category', visible: false)
      expect(page).not_to have_select('resource_owner_id', visible: false)
      expect(page).not_to have_select('resource_dimension_id', visible: false)
      expect(page).to have_select('resource_mindmill_id', visible: false)
    end
  end

  scenario 'When create Mindmill Assessment
            Then should see in the table' do
    visit '/administration/assessments'
    click_link(t('administration.assessments.index.new'), href: '/administration/assessments/new')
    within '#assessments_form' do
      select t('activerecord.attributes.assessment.types.mindmill'), from: 'resource_type', visible: false
      fill_in t('activerecord.attributes.assessment.name'), with: 'New Mindmill Assessment'
      click_button t('administration.create')
      wait_for_ajax
    end
    expect(page).to have_content t('administration.assessments.create.successfully', name: 'New Mindmill Assessment')
    expect(page).not_to have_css('#assessments_list td a', text: 'New Mindmill Assessment')
    expect(page).to have_css('#assessments_list td', text: 'New Mindmill Assessment')
    expect(page).to have_content(t('activerecord.attributes.assessment.types.mindmill'))
  end

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
      within '#edit_resource' do
        fill_in 'resource_name', with: 'My updated assessment'
        click_on t('administration.update')
      end
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
