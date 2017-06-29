require 'rails_helper'
include Features::Helpers::Norms

feature 'CRUD Norm' do
  given!(:dimension) { create :dimension, name: 'Agile' }
  before { enter_as :superadmin }

  scenario 'Create Norm' do
    create_norm(name: 'My norm', dimension_name: 'Agile')
    expect(page).to have_content t('administration.norms.create.successfully', name: 'My norm')
    expect(page).to have_css('#norms_list td', text: 'My norm')
  end

  context 'Update, Destroy' do
    given!(:norm) { create(:norm, name: 'My norm') }
    before { visit '/administration/norms' }

    scenario 'Edit Norm' do
      find("#norm_#{norm.id} .edit").click
      fill_in 'resource_name', with: 'My updated norm'
      click_on 'Update'
      expect(page).to have_content t('administration.norms.update.successfully', name: 'My updated norm')
      expect(page).to have_css('#norms_list td', text: 'My updated norm')
    end

    scenario 'Destroy Norm' do
      find("#norm_#{norm.id} .delete").click
      find(:button, text: 'Yes').click
      expect(page).to have_content t('administration.norms.destroy.successfully', name: 'My norm')
      expect(page).to have_no_css('#norms_list td', text: 'My norm')
    end
  end
end
