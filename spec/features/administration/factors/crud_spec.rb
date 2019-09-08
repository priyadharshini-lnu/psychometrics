# frozen_string_literal: true

require 'rails_helper'

feature 'CRUD Factor' do
  before(:each) { enter_as :superadmin }
  given!(:dimension) { create :dimension }

  scenario 'Create Factor' do
    visit "/administration/dimensions/#{dimension.id}/factors"
    find('.panel-heading a', text: t('administration.factors.index.new')).click
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

      find("#factor_#{factor.id} .edit").click
      wait_for_ajax
      fill_in 'resource_name', with: 'Employment Thriving No Index'
      click_on 'Update'
      wait_for_ajax
      expect(page).to have_content 'Employment Thriving No Index'
    end

    scenario 'Destroy Factor' do
      visit "/administration/dimensions/#{dimension.id}/factors"

      find("#factor_#{factor.id} .delete").click
      find(:button, text: 'Yes').click
      within '#factors-list' do
        expect(page).to_not have_content 'Drive'
      end
    end
  end
end
