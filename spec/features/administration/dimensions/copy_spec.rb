# frozen_string_literal: true

require 'rails_helper'

feature 'Copy Dimension' do
  before(:each) { enter_as :superadmin }

  given!(:dimension) { create(:dimension, name: 'New Dim') }
  scenario 'Copy Dimension' do
    visit '/administration/dimensions'
    within "#dimension_#{dimension.id}" do
      find('.copy').click
    end
    wait_for_ajax
    expect(page).to have_content 'New Dim (1)'
  end
end
