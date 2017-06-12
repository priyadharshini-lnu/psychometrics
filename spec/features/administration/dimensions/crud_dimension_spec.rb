require 'rails_helper'

feature 'CRUD Dimension' do

  before(:each) { logged_in_as :superadmin }

  scenario 'Create Dimension' do
    visit '/administration/dimensions'
    find('.panel-heading a', text: t('administration.dimensions.index.new')).click
    wait_for_ajax
    fill_in 'resource_name', with: 'Employment Thriving Index'
    click_on 'Create'
    wait_for_ajax
    expect(page).to have_content 'Employment Thriving Index'
  end

  context do
    given!(:dimension) { create(:dimension, name: 'New Dim') }
    scenario 'Edit Dimension' do
      visit '/administration/dimensions'
      find("#dimension_#{dimension.id} .edit").click
      wait_for_ajax
      fill_in 'resource_name', with: 'Employment Thriving No Index'
      click_on 'Update'
      wait_for_ajax
      expect(page).to have_content 'Employment Thriving No Index'
    end

    scenario 'Destroy Dimension' do
      visit '/administration/dimensions'
      find("#dimension_#{dimension.id} .delete").click
      find(:button, text: 'Yes').click
      wait_for_ajax
      sleep 1
      within '#dimensions-list' do
        expect(page).to_not have_content 'New Dim'
      end
    end
  end
end
