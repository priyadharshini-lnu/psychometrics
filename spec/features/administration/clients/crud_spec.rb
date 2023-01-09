# frozen_string_literal: true

require 'rails_helper'
include Features::Helpers::Clients

feature 'CRUD Client' do
  given(:report_family) { create(:report_family) }
  given(:report) { create(:report, report_families: [report_family]) }

  context 'As Client Admin' do
    given!(:tenancy) { create(:tenancy) }
    given!(:project) { create(:project, :sub_campaign_level, parent: tenancy) }
    given!(:admin) { create(:client_admin, memberships_options: [{ client: tenancy }]) }

    before { login_as admin }

    before do
      admin.memberships.first.grants.update(data: admin.memberships.first.grants.data.
      merge!(projects: %w[view], campaigns: ['manage']))
    end

    context 'without manage privileges' do
      scenario 'I cant create any client' do
        visit administration_client_projects_path(tenancy)
        expect(page).not_to have_css('.panel-heading a', text: t('administration.clients.projects.index.new'))
      end
    end

    context 'with manage privileges' do
      before do
        admin.memberships.first.grants.update(data: admin.memberships.first.grants.data.
        merge!(projects: %w[manage view], campaigns: ['manage']))
      end

      scenario 'I cant create root' do
        visit administration_clients_path
        expect(page).not_to have_css('#manage_first_level')
      end
    end
  end
end
