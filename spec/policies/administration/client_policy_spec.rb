# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::ClientPolicy do
  before { allow(Settings.features).to receive(:communication_center_enabled).and_return(true) }

  let(:client) { create(:tenancy) }
  let(:other_client) { create(:tenancy) }

  describe '#view_communication_center?' do
    before do
      client.client_feature.update!(use_new_communication_center: true)
      other_client.client_feature.update!(use_new_communication_center: true)
    end

    it 'allows a superadmin' do
      policy = described_class.new(create(:superadmin), client, project_id: client.id)

      expect(policy.view_communication_center?).to eq(true)
    end

    it 'allows a client admin with a communications grant scoped to their own client' do
      user = create(:client_admin, client: client)
      policy = described_class.new(user, client, project_id: client.id)

      expect(policy.view_communication_center?).to eq(true)
    end

    it 'denies a client admin scoped to an unrelated client' do
      user = create(:client_admin, client: client)
      policy = described_class.new(user, other_client, project_id: other_client.id)

      expect(policy.view_communication_center?).to eq(false)
    end

    it 'denies everyone when the feature flag is off, even a superadmin' do
      allow(Settings.features).to receive(:communication_center_enabled).and_return(false)
      policy = described_class.new(create(:superadmin), client, project_id: client.id)

      expect(policy.view_communication_center?).to eq(false)
    end

    it 'denies everyone when use_new_communication_center is disabled for the client, even a superadmin' do
      client.client_feature.update!(use_new_communication_center: false)
      policy = described_class.new(create(:superadmin), client, project_id: client.id)

      expect(policy.view_communication_center?).to eq(false)
    end
  end
end
