require 'rails_helper'
include Features::Helpers::Clients

feature 'CRUD Client' do
  given(:superadmin) { create(:superadmin) }
  given(:report_family) { create(:report_family) }
  given(:report) { create(:report, report_families: [report_family]) }

  context 'As Super user' do
    before { login_as superadmin }

    scenario 'I can create any client' do
      import_countries
      tenancy = create_tenancy(name: 'TTE',
                               number: 1,
                               country: Data::Geo.take.country_name,
                               year: Date.today.year,
                               account_manager: 'super admin',
                               project_manager: 'super admin',
                               report_families: [report_family.name])

      project = create_project(tenancy,
                               name: 'Project',
                               subdomain: 'project',
                               number: 2,
                               applicable_level: 'Sub-Campaign',
                               reports: [report.name])

      campaign = create_campaign(tenancy, project, name: 'Campaign')
      create_sub_campaign(tenancy, project, campaign, name: 'SubCampaign')
    end
  end
end
