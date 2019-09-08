# frozen_string_literal: true

require 'rails_helper'

feature 'CRUD Dimension' do
  context 'as Super Admin' do
    before(:each) { enter_as :superadmin }

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

  context 'as Client Admin' do
    let(:client_admin) { create(:client_admin) }
    before { login_as(client_admin) }

    scenario 'I cant Create Dimension without privileges' do
      client_admin.memberships.first.grants.update(data: client_admin.memberships.first.grants.data.merge!(dimensions: ['view']))
      visit '/administration/dimensions'
      expect(page).not_to have_css('.panel-heading a', text: t('administration.dimensions.index.new'))
    end

    scenario 'I can Create Dimension if I have privileges' do
      client_admin.memberships.first.grants.update(data: client_admin.memberships.first.grants.data.merge!(dimensions: %w[view manage]))
      visit '/administration/dimensions'
      find('.panel-heading a', text: t('administration.dimensions.index.new')).click
      wait_for_ajax
      fill_in 'resource_name', with: 'Employment Thriving Index'
      click_on 'Create'
      wait_for_ajax
      expect(page).to have_content 'Employment Thriving Index'
    end
  end
end
