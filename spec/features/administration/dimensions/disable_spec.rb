require 'rails_helper'

feature 'Toggle Status in Dimension' do

  before(:each) { enter_as :superadmin }

  given!(:dimension) { create(:dimension, name: 'New Dim') }
  scenario 'Toggle Status in Dimension' do
    visit '/administration/dimensions'
    find("#dimension_#{dimension.id} .toggle-status").click
    expect(page).to have_content 'Disable'
    find(:button, text: 'Yes').click
    wait_for_ajax
    expect(dimension.reload.disabled).to be true

    visit '/administration/dimensions'
    find("#dimension_#{dimension.id} .toggle-status").click
    expect(page).to have_content 'Enable'
    find(:button, text: 'Yes').click
    wait_for_ajax
    expect(dimension.reload.disabled).to be false
  end
end
