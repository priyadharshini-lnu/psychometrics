require 'rails_helper'

feature 'Show Usage Licenses for Client Tenancy' do
  before(:each) do
    logged_in_as :superadmin
  end

  given!(:client) { create(:tenancy, no_license: true) }

  scenario 'SA should be able to see usage licenses statistics' do
  end
end
