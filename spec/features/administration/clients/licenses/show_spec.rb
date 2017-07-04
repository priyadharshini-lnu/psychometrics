require 'rails_helper'

feature 'Show Usage Licenses for Client Tenancy' do
  before(:each) do
    enter_as :superadmin
  end

  given!(:client) { create(:tenancy) }

  scenario 'SA should be able to see usage licenses statistics' do
  end
end
