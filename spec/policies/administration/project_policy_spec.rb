# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::ProjectPolicy do
  before { allow(Settings.features).to receive(:communication_center_enabled).and_return(true) }

  let(:client) { create(:tenancy) }
  let(:project) { create(:project, parent: client) }
  let(:other_client) { create(:tenancy) }
  let(:other_project) { create(:project, parent: other_client) }

  describe '#view_communication_center?' do
    before do
      client.client_feature.update!(use_new_communication_center: true)
      other_client.client_feature.update!(use_new_communication_center: true)
    end

    it 'allows a superadmin' do
      policy = described_class.new(create(:superadmin), project, project_id: project.id)

      expect(policy.view_communication_center?).to eq(true)
    end

    it 'allows a project admin with a communications grant scoped to their own project' do
      user = create(:project_admin, project: project)
      policy = described_class.new(user, project, project_id: project.id)

      expect(policy.view_communication_center?).to eq(true)
    end

    it 'denies a project admin scoped to an unrelated project' do
      user = create(:project_admin, project: project)
      policy = described_class.new(user, other_project, project_id: other_project.id)

      expect(policy.view_communication_center?).to eq(false)
    end

    it 'denies everyone when the feature flag is off, even a superadmin' do
      allow(Settings.features).to receive(:communication_center_enabled).and_return(false)
      policy = described_class.new(create(:superadmin), project, project_id: project.id)

      expect(policy.view_communication_center?).to eq(false)
    end

    it 'denies everyone when use_new_communication_center is disabled for the client, even a superadmin' do
      client.client_feature.update!(use_new_communication_center: false)
      policy = described_class.new(create(:superadmin), project, project_id: project.id)

      expect(policy.view_communication_center?).to eq(false)
    end

    it 'allows at campaign scope when the campaign resolves to a client with the flag enabled' do
      campaign = create(:campaign, project: project)
      policy = described_class.new(create(:superadmin), nil, project_id: project.id, campaign_id: campaign.id)

      expect(policy.view_communication_center?).to eq(true)
    end

    it 'denies at campaign scope when the campaign resolves to a client with the flag disabled' do
      client.client_feature.update!(use_new_communication_center: false)
      campaign = create(:campaign, project: project)
      policy = described_class.new(create(:superadmin), nil, project_id: project.id, campaign_id: campaign.id)

      expect(policy.view_communication_center?).to eq(false)
    end
  end
end
