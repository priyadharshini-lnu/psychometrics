require 'rails_helper'

feature 'CRUD Factor' do

  before(:each) { logged_in_as :superadmin }
  given!(:dimension) { create :dimension }

  scenario 'Create Factor' do
    visit "/administration/dimensions/#{dimension.id}/factors"
    within '.panel-heading ' do
      find('.create').click
    end
    wait_for_ajax
    fill_in 'resource_name', with: 'Employment Thriving Index'
    click_on 'Create'
    wait_for_ajax
    expect(page).to have_content 'Employment Thriving Index'
  end

  context 'I have a factor' do
    given!(:factor) { create(:factor, name: 'Drive', dimension: dimension) }
    scenario 'Edit Factor' do
      visit "/administration/dimensions/#{dimension.id}/factors"

      within "#factor_#{factor.id}" do
        find('.edit').click
      end
      wait_for_ajax
      fill_in 'resource_name', with: 'Employment Thriving No Index'
      click_on 'Update'
      wait_for_ajax
      expect(page).to have_content 'Employment Thriving No Index'
    end

    scenario 'Destroy Factor' do
      visit "/administration/dimensions/#{dimension.id}/factors"

      within "#factor_#{factor.id}" do
        find('.delete').click
      end
      find(:button, text: 'Yes').click
      within '#factors-list' do
        expect(page).to_not have_content 'Drive'
      end
    end
  end
end
