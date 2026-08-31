# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::Administration::CommunicationDeliveryPolicy do
  before { allow(Settings.features).to receive(:communication_center_enabled).and_return(true) }

  let(:client) { create(:tenancy) }
  let(:project) { create(:project, parent: client) }
  let(:campaign) { create(:campaign, project: project) }

  let(:other_client) { create(:tenancy) }
  let(:other_project) { create(:project, parent: other_client) }

  before do
    client.client_feature.update!(use_new_communication_center: true)
    other_client.client_feature.update!(use_new_communication_center: true)
  end

  let!(:campaign_delivery) { create(:communication_delivery, client: client, project: project, campaign: campaign) }
  let!(:magic_link_delivery) do
    create(:communication_delivery, :magic_link_email, client: client, project: project)
  end
  let!(:other_project_magic_link_delivery) do
    create(:communication_delivery, :magic_link_email, client: other_client, project: other_project)
  end

  describe 'Scope' do
    subject(:resolved) { described_class::Scope.new(user, CommunicationDelivery).resolve }

    context 'for a campaign admin' do
      let(:user) { create(:campaign_admin, campaign: campaign) }

      it 'includes deliveries for their campaign but not project-scoped deliveries from another project' do
        expect(resolved).to include(campaign_delivery)
        expect(resolved).not_to include(other_project_magic_link_delivery)
      end
    end

    context 'for a project admin' do
      let(:user) { create(:project_admin, project: project) }

      it 'includes project-scoped deliveries for their own project only' do
        expect(resolved).to include(magic_link_delivery)
        expect(resolved).not_to include(other_project_magic_link_delivery)
      end
    end

    context 'for a client admin' do
      let(:user) { create(:client_admin, client: client) }

      it 'includes both campaign-scoped and project-scoped deliveries under their client' do
        expect(resolved).to include(campaign_delivery, magic_link_delivery)
        expect(resolved).not_to include(other_project_magic_link_delivery)
      end

      it 'excludes both when use_new_communication_center is disabled for their client' do
        client.client_feature.update!(use_new_communication_center: false)

        expect(resolved).not_to include(campaign_delivery, magic_link_delivery)
      end
    end

    context 'for a campaign admin whose client has use_new_communication_center disabled' do
      let(:user) { create(:campaign_admin, campaign: campaign) }

      it 'excludes their campaign delivery' do
        client.client_feature.update!(use_new_communication_center: false)

        expect(resolved).not_to include(campaign_delivery)
      end
    end
  end

  describe '#show?' do
    it 'allows a project admin to view a project-scoped delivery for their own project' do
      user = create(:project_admin, project: project)

      expect(described_class.new(user, magic_link_delivery).show?).to eq(true)
    end

    it 'denies a project admin viewing a project-scoped delivery from another project' do
      user = create(:project_admin, project: project)

      expect(described_class.new(user, other_project_magic_link_delivery).show?).to eq(false)
    end

    it 'allows a client admin to view deliveries under their own client' do
      user = create(:client_admin, client: client)

      expect(described_class.new(user, campaign_delivery).show?).to eq(true)
    end

    it 'denies a client admin viewing a delivery under their own client when the flag is disabled' do
      client.client_feature.update!(use_new_communication_center: false)
      user = create(:client_admin, client: client)

      expect(described_class.new(user, campaign_delivery).show?).to eq(false)
    end
  end

  describe '#create?' do
    let(:superadmin) { create(:superadmin) }

    it 'allows a superadmin' do
      expect(described_class.new(superadmin, CommunicationDelivery).create?).to eq(true)
    end

    it 'allows a project admin to create within their own project' do
      user = create(:project_admin, project: project)
      policy = described_class.new(user, CommunicationDelivery, project_id: project.id)

      expect(policy.create?).to eq(true)
    end

    it 'allows a campaign admin to create within their own campaign' do
      user = create(:campaign_admin, campaign: campaign)
      policy = described_class.new(user, CommunicationDelivery, campaign_id: campaign.id)

      expect(policy.create?).to eq(true)
    end

    it 'denies a project admin creating under an unrelated project ' \
       '(regression: create? used to be unscoped)' do
      user = create(:project_admin, project: project)
      policy = described_class.new(user, CommunicationDelivery, project_id: other_project.id)

      expect(policy.create?).to eq(false)
    end

    it 'denies everyone with no project/campaign scope at all' do
      user = create(:project_admin, project: project)
      policy = described_class.new(user, CommunicationDelivery)

      expect(policy.create?).to eq(false)
    end

    it 'denies a project admin creating within their own project when use_new_communication_center is disabled' do
      client.client_feature.update!(use_new_communication_center: false)
      user = create(:project_admin, project: project)
      policy = described_class.new(user, CommunicationDelivery, project_id: project.id)

      expect(policy.create?).to eq(false)
    end
  end

  describe '#cancel?' do
    it 'allows a client admin to cancel a delivery under their own client' do
      user = create(:client_admin, client: client)

      expect(described_class.new(user, campaign_delivery).cancel?).to eq(true)
    end

    it 'denies a client admin cancelling a delivery under an unrelated client' do
      user = create(:client_admin, client: client)

      expect(described_class.new(user, other_project_magic_link_delivery).cancel?).to eq(false)
    end

    it 'denies a client admin cancelling a delivery under their own client when the flag is disabled' do
      client.client_feature.update!(use_new_communication_center: false)
      user = create(:client_admin, client: client)

      expect(described_class.new(user, campaign_delivery).cancel?).to eq(false)
    end
  end

  describe '#destroy?' do
    it 'aliases #cancel?' do
      user = create(:client_admin, client: client)
      policy = described_class.new(user, campaign_delivery)

      expect(policy.destroy?).to eq(policy.cancel?)
    end
  end

  describe '#update_translation?' do
    it 'aliases #cancel?' do
      user = create(:client_admin, client: client)
      policy = described_class.new(user, campaign_delivery)

      expect(policy.update_translation?).to eq(policy.cancel?)
    end
  end
end
