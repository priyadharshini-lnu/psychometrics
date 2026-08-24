# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::Administration::CommunicationTemplatePolicy do
  before { allow(Settings.features).to receive(:communication_center_enabled).and_return(true) }

  let(:client) { create(:tenancy) }
  let(:project) { create(:project, parent: client) }
  let(:campaign) { create(:campaign, project: project) }

  let(:other_client) { create(:tenancy) }
  let(:other_project) { create(:project, parent: other_client) }
  let(:other_campaign) { create(:campaign, project: other_project) }

  before do
    client.client_feature.update!(use_new_communication_center: true)
    other_client.client_feature.update!(use_new_communication_center: true)
  end

  let!(:platform_template) do
    create(:communication_template, level: :platform, client: nil, project: nil, campaign: nil)
  end
  let!(:client_template) do
    create(:communication_template, level: :client, client: client, project: nil, campaign: nil)
  end
  let!(:project_template) do
    create(:communication_template, level: :project, client: client, project: project, campaign: nil)
  end
  let!(:campaign_template) do
    create(:communication_template, level: :campaign, client: client, project: project, campaign: campaign)
  end
  let!(:other_client_template) do
    create(:communication_template, level: :client, client: other_client, project: nil, campaign: nil)
  end

  describe '#create?' do
    let(:superadmin) { create(:superadmin) }

    it 'allows a superadmin to create a platform-level template (no project/campaign scope)' do
      policy = described_class.new(superadmin, CommunicationTemplate)

      expect(policy.create?).to eq(true)
    end

    it 'denies a non-superadmin creating a platform-level template (no project/campaign scope)' do
      user = create(:client_admin, client: client)
      policy = described_class.new(user, CommunicationTemplate)

      expect(policy.create?).to eq(false)
    end

    it 'allows a client admin to create within their own client' do
      user = create(:client_admin, client: client)
      policy = described_class.new(user, CommunicationTemplate, project_id: client.id)

      expect(policy.create?).to eq(true)
    end

    it 'allows a project admin to create within their own project' do
      user = create(:project_admin, project: project)
      policy = described_class.new(user, CommunicationTemplate, project_id: project.id)

      expect(policy.create?).to eq(true)
    end

    it 'allows a campaign admin to create within their own campaign' do
      user = create(:campaign_admin, campaign: campaign)
      policy = described_class.new(user, CommunicationTemplate, campaign_id: campaign.id)

      expect(policy.create?).to eq(true)
    end

    it 'denies a campaign admin creating under an unrelated project (regression: create? used to be unscoped)' do
      user = create(:campaign_admin, campaign: campaign)
      policy = described_class.new(user, CommunicationTemplate, project_id: other_project.id)

      expect(policy.create?).to eq(false)
    end

    it 'denies a project admin creating under an unrelated client' do
      user = create(:project_admin, project: project)
      policy = described_class.new(user, CommunicationTemplate, project_id: other_client.id)

      expect(policy.create?).to eq(false)
    end

    it 'denies everyone when the feature flag is off, even a superadmin' do
      allow(Settings.features).to receive(:communication_center_enabled).and_return(false)
      policy = described_class.new(superadmin, CommunicationTemplate)

      expect(policy.create?).to eq(false)
    end

    it 'denies a client admin creating within their own client when use_new_communication_center is disabled' do
      client.client_feature.update!(use_new_communication_center: false)
      user = create(:client_admin, client: client)
      policy = described_class.new(user, CommunicationTemplate, project_id: client.id)

      expect(policy.create?).to eq(false)
    end

    it 'allows a superadmin to create a platform-level template even when no client has the flag enabled' do
      client.client_feature.update!(use_new_communication_center: false)
      other_client.client_feature.update!(use_new_communication_center: false)
      policy = described_class.new(superadmin, CommunicationTemplate)

      expect(policy.create?).to eq(true)
    end
  end

  describe '#show?' do
    it 'allows a client admin to view a template under their own client' do
      user = create(:client_admin, client: client)

      expect(described_class.new(user, project_template).show?).to eq(true)
    end

    it 'denies a client admin viewing a template under an unrelated client' do
      user = create(:client_admin, client: client)

      expect(described_class.new(user, other_client_template).show?).to eq(false)
    end

    it 'denies a client admin viewing a template under their own client when the flag is disabled' do
      client.client_feature.update!(use_new_communication_center: false)
      user = create(:client_admin, client: client)

      expect(described_class.new(user, project_template).show?).to eq(false)
    end

    it 'allows a superadmin to view a platform-level template even when no client has the flag enabled' do
      client.client_feature.update!(use_new_communication_center: false)
      superadmin = create(:superadmin)

      expect(described_class.new(superadmin, platform_template).show?).to eq(true)
    end
  end

  describe '#update?' do
    it 'allows a client admin to update a template under their own client' do
      user = create(:client_admin, client: client)

      expect(described_class.new(user, project_template).update?).to eq(true)
    end

    it 'denies a client admin updating a template under an unrelated client' do
      user = create(:client_admin, client: client)

      expect(described_class.new(user, other_client_template).update?).to eq(false)
    end

    it 'denies a client admin updating a template under their own client when the flag is disabled' do
      client.client_feature.update!(use_new_communication_center: false)
      user = create(:client_admin, client: client)

      expect(described_class.new(user, project_template).update?).to eq(false)
    end

    it 'governs an archive (status: archived) transition the same as any other attribute edit -- no separate ' \
       'archive? action exists by design, see the W5 plan notes' do
      user = create(:client_admin, client: client)

      expect(described_class.new(user, project_template).update?).to eq(true)
    end
  end

  describe '#destroy?' do
    it 'aliases #update?' do
      user = create(:client_admin, client: client)
      policy = described_class.new(user, project_template)

      expect(policy.destroy?).to eq(policy.update?)
    end
  end

  describe '#update_translation?' do
    it 'aliases #update?' do
      user = create(:client_admin, client: client)
      policy = described_class.new(user, project_template)

      expect(policy.update_translation?).to eq(policy.update?)
    end
  end

  describe 'Scope' do
    subject(:resolved) { described_class::Scope.new(user, CommunicationTemplate).resolve }

    context 'for a campaign admin with no separate client/project admin membership' do
      let(:user) { create(:campaign_admin, campaign: campaign) }

      it 'includes platform, client, and project ancestors of the campaign, plus the campaign template' do
        expect(resolved).to contain_exactly(platform_template, client_template, project_template, campaign_template)
      end

      it 'excludes templates from an unrelated client' do
        expect(resolved).not_to include(other_client_template)
      end
    end

    context 'for a client admin' do
      let(:user) { create(:client_admin, client: client) }

      it 'includes platform plus every template under their client (client/project/campaign levels)' do
        expect(resolved).to contain_exactly(platform_template, client_template, project_template, campaign_template)
      end

      it 'excludes templates from an unrelated client' do
        expect(resolved).not_to include(other_client_template)
      end

      it 'excludes their own client/project/campaign templates when use_new_communication_center is disabled ' \
         'for their client, keeping platform-level ones' do
        client.client_feature.update!(use_new_communication_center: false)

        expect(resolved).to contain_exactly(platform_template)
      end
    end

    context 'for a campaign admin whose client has use_new_communication_center disabled' do
      let(:user) { create(:campaign_admin, campaign: campaign) }

      it 'excludes their campaign template too, keeping only platform-level ones' do
        client.client_feature.update!(use_new_communication_center: false)

        expect(resolved).to contain_exactly(platform_template)
      end
    end

    context 'under real tenant scoping (ActsAsTenant.current_tenant set, as in an actual request)' do
      # Regression coverage for a real bug: platform_template has tenant_id: nil by design (visible to
      # every tenant), but acts_as_tenant's default scope silently drops nil-tenant rows once a current
      # tenant is set. Every other example in this file runs with ActsAsTenant.current_tenant nil (see
      # spec/support/acts_as_tenant.rb's global before/after reset), so none of them would have caught
      # this -- only a spec that explicitly wraps in with_tenant exercises the real-request condition.
      it 'still includes platform-level templates' do
        user = create(:campaign_admin, campaign: campaign)

        ActsAsTenant.with_tenant(client) do
          expect(described_class::Scope.new(user, CommunicationTemplate).resolve).to include(platform_template)
        end
      end
    end
  end
end
