require 'rails_helper'

feature 'Toggle Status in Factor' do

  before(:each) { logged_in_as :superadmin }

  given!(:dimension) { create(:dimension) }
  given!(:factor) { create(:factor, name: 'Drive', dimension: dimension) }

  scenario 'Toggle Status in Factor' do
    visit "/administration/dimensions/#{dimension.id}/factors"
    within "#factor_#{factor.id}" do
      find('.toggle-status').click
    end
    wait_for_ajax
    expect(factor.reload.disabled).to be true
    within "#factor_#{factor.id}" do
      find('.toggle-status').click
    end
    wait_for_ajax
    expect(factor.reload.disabled).to be false
  end
end
