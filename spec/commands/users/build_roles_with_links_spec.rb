# frozen_string_literal: true

require 'rails_helper'

describe Users::BuildRolesWithLinks do
  let!(:superadmin) { create(:superadmin) }
  let!(:user) { create(:user, project: project) }
  let!(:campaign) { create(:campaign) }
  let!(:project) { campaign.project }
  let!(:client) { project.client }
  let!(:client_membership) { create(:client_admin_membership, user: user, client: client) }
  let!(:project_membership) { create(:project_admin_membership, user: user, client: project) }
  let!(:campaign_membership) { create(:campaign_admin_membership, user: user, campaign: campaign) }

  describe 'gen roles with links' do
    it do
      roles = described_class.call!(user)
      expect(roles).to eq [
        { :name => 'client_admin',
          :paths => [
            { :name => client.name, :value => "/administration/clients/#{client.id}/projects" }
          ] },
        { :name => 'project_admin', :paths => [
          { :name => client.name, :value => "/administration/clients/#{client.id}/projects" },
          { :name => project.name, :value => "/administration/projects/#{project.id}/new_campaigns" }
        ] },
        { :name => 'campaign_admin',
          :paths => [
            { :name => client.name, :value => "/administration/clients/#{client.id}/projects" },
            { :name => project.name, :value => "/administration/projects/#{project.id}/new_campaigns" },
            {
              :name => campaign.name, :value => "/administration/projects/#{project.id}/new_campaigns/#{campaign.id}"
            }
          ] }
      ]
    end
  end

  describe 'when the user is superadmin' do
    it 'generates just an object for superadmin without links' do
      roles = described_class.call!(superadmin)
      expect(roles).to eq [{ name: 'superadmin', paths: [] }]
    end
  end
end
