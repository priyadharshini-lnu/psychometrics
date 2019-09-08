# frozen_string_literal: true

require 'rails_helper'
include Features::Helpers::Clients

feature 'CRUD Client' do
  given(:report_family) { create(:report_family) }
  given(:report) { create(:report, report_families: [report_family]) }

  context 'As Superadmin' do
    given(:superadmin) { create(:superadmin) }
    before { login_as superadmin }

    scenario 'I can create any client' do
      import_countries
      tenancy = create_tenancy(name: 'TTE',
                               number: 1,
                               country: ::Datas::Geo.take.country_name,
                               year: Date.today.year,
                               account_manager: 'super admin',
                               project_manager: 'super admin')

      project = create_project(tenancy,
                               name: 'Project',
                               subdomain: 'project',
                               number: 2,
                               applicable_level: 'Sub-Campaign')

      campaign = create_campaign(tenancy, project, name: 'Campaign')
      create_sub_campaign(tenancy, project, campaign, name: 'SubCampaign')
    end
  end

  context 'As Client Admin' do
    given!(:tenancy) { create(:tenancy) }
    given!(:project) { create(:project, :sub_campaign_level, parent: tenancy) }
    given!(:admin) { create(:client_admin, memberships_options: [{ client: tenancy }]) }
    before { login_as admin }

    context 'without manage privileges' do
      scenario 'I cant create any client' do
        visit administration_client_projects_path(tenancy)
        expect(page).not_to have_css('.panel-heading a', text: t('administration.clients.projects.index.new'))
      end
    end

    context 'with manage privileges' do
      before { admin.memberships.first.grants.update(data: admin.memberships.first.grants.data.merge!(clients: ['manage'])) }

      scenario 'I can create any client within tte' do
        new_project = create_project(tenancy,
                                     name: 'New Project',
                                     subdomain: 'new_project',
                                     number: 2,
                                     applicable_level: 'Sub-Campaign',
                                     reports: [report.name])

        campaign = create_campaign(tenancy, new_project, name: 'Campaign')
        create_sub_campaign(tenancy, new_project, campaign, name: 'SubCampaign')
      end

      scenario 'I cant create root' do
        visit administration_clients_path
        expect(page).not_to have_css('#manage_first_level')
      end
    end
  end
end
