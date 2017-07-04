require 'rails_helper'

feature 'Copy Factor' do

  before(:each) { enter_as :superadmin }
  given!(:dimension) { create :dimension }
  given!(:factor) { create(:factor, name: 'Drive', dimension: dimension) }
  scenario 'Copy Factor' do
    visit "/administration/dimensions/#{dimension.id}/factors"
    within "#factor_#{factor.id}" do
      find('.copy').click
    end
    wait_for_ajax
    expect(page).to have_content 'Drive (1)'
  end
end
