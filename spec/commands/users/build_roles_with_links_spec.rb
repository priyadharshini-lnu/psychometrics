# frozen_string_literal: true

require 'rails_helper'

describe Users::BuildRolesWithLinks do
  let!(:superadmin) { create(:superadmin) }
  let!(:admin) { create(:user, project: project, role: 'Users::Admin') }
  let!(:regular) { create(:user, project: project) }
  let!(:campaign) { create(:campaign) }
  let!(:project) { campaign.project }
  let!(:client) { project.client }
  let!(:client_membership) { create(:client_admin_membership, user: admin, client: client) }
  let!(:project_membership) { create(:project_admin_membership, user: admin, client: project) }
  let!(:campaign_membership) { create(:campaign_admin_membership, user: admin, campaign: campaign) }

  describe 'gen roles with links for admin' do
    it do
      roles = described_class.call!(admin)
      expect(roles).to eq [
        { :name => 'client_admin',
          :paths => [
            { :name => client.name, :value => "/admin/clients/#{client.id}/projects" }
          ] },
        { :name => 'project_admin', :paths => [
          { :name => client.name, :value => "/admin/clients/#{client.id}/projects" },
          { :name => project.name, :value => "/admin/projects/#{project.id}/new_campaigns" }
        ] },
        { :name => 'campaign_admin',
          :paths => [
            { :name => client.name, :value => "/admin/clients/#{client.id}/projects" },
            { :name => project.name, :value => "/admin/projects/#{project.id}/new_campaigns" },
            {
              :name => campaign.name, :value => "/admin/projects/#{project.id}/new_campaigns/#{campaign.id}/admins"
            }
          ] }
      ]
    end
  end

  describe 'gen roles with links for regular user' do
    before do
      create(:campaign_user, user: regular)
      create(:campaign_user, user: regular)
    end

    it do
      roles = described_class.call!(regular)

      expect(roles.length).to eq(2)
      expect(roles.first[:name]).to eq('campaign_user')
      expect(roles.first[:paths].length).to eq(3)
    end
  end

  describe 'gen roles with links for regular 360 user' do
    let(:campaign) { create(:campaign, type: :threesixty) }
    let!(:threesixty_campaign) { create(:threesixty_campaign, campaign: campaign) }
    before do
      create(:campaign_user, user: regular, campaign: campaign)
    end

    it do
      roles = described_class.call!(regular)

      expect(roles.first[:paths].last[:value]).to eq("/admin/projects/#{campaign.project.id}/new_campaigns/#{campaign.id}") # rubocop:disable Layout/LineLength
    end
  end

  describe 'when the user is superadmin' do
    it 'generates just an object for superadmin without links' do
      roles = described_class.call!(superadmin)
      expect(roles).to eq [{ name: 'superadmin', paths: [] }]
    end
  end
end
