# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::Campaigns::CampaignSerializer do
  before { allow(Settings.features).to receive(:communication_center_enabled).and_return(true) }

  let(:client) { create(:tenancy) }
  let(:project) { create(:project, parent: client) }
  let(:campaign) { create(:campaign, project: project) }

  # Regression coverage: campaign-level nav (Campaign/Navigation.tsx) has no dedicated
  # Administration::CampaignPolicy#view_communication_center? -- it reuses
  # Administration::ProjectPolicy#view_communication_center? via a merged GetPermissionsHash call, the
  # same permission Client/Project nav already consume. This spec exists because prior to that fix,
  # campaign-level nav bypassed the grant/client-flag check entirely.
  describe '#permissions' do
    subject(:permissions) do
      described_class.new(context: { current_user: user }).serialize(campaign)['permissions']
    end

    context 'when the client has use_new_communication_center enabled' do
      let(:user) { create(:superadmin) }

      before { client.client_feature.update!(use_new_communication_center: true) }

      it 'includes view_communication_center: true for a superadmin' do
        expect(permissions['view_communication_center']).to eq(true)
      end
    end

    context 'when the client has use_new_communication_center disabled (default)' do
      let(:user) { create(:superadmin) }

      it 'includes view_communication_center: false' do
        expect(permissions['view_communication_center']).to eq(false)
      end
    end

    context 'when the global feature flag is off, even with the client flag enabled' do
      let(:user) { create(:superadmin) }

      before do
        client.client_feature.update!(use_new_communication_center: true)
        allow(Settings.features).to receive(:communication_center_enabled).and_return(false)
      end

      it 'includes view_communication_center: false' do
        expect(permissions['view_communication_center']).to eq(false)
      end
    end
  end
end
