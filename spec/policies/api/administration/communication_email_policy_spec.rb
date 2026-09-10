# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::Administration::CommunicationEmailPolicy do
  before { allow(Settings.features).to receive(:communication_center_enabled).and_return(true) }

  let(:client) { create(:tenancy) }
  let(:project) { create(:project, parent: client) }

  let(:other_client) { create(:tenancy) }
  let(:other_project) { create(:project, parent: other_client) }

  before do
    client.client_feature.update!(use_new_communication_center: true)
    other_client.client_feature.update!(use_new_communication_center: true)
  end

  let(:magic_link_delivery) do
    create(:communication_delivery, :magic_link_email, client: client, project: project)
  end
  let(:other_project_delivery) do
    create(:communication_delivery, :magic_link_email, client: other_client, project: other_project)
  end
  let!(:email) do
    create(:communication_email, communication: nil, communication_delivery: magic_link_delivery, user: create(:user))
  end
  let!(:other_project_email) do
    create(:communication_email, communication: nil, communication_delivery: other_project_delivery,
                                  user: create(:user))
  end

  describe '#show?' do
    it 'allows a project admin to view an email for a delivery in their own project' do
      user = create(:project_admin, project: project)

      expect(described_class.new(user, email).show?).to eq(true)
    end

    it 'denies a project admin viewing an email from another project' do
      user = create(:project_admin, project: project)

      expect(described_class.new(user, other_project_email).show?).to eq(false)
    end

    it 'allows a client admin to view an email for a delivery under their own client' do
      user = create(:client_admin, client: client)

      expect(described_class.new(user, email).show?).to eq(true)
    end

    it 'allows a superadmin' do
      user = create(:superadmin)

      expect(described_class.new(user, other_project_email).show?).to eq(true)
    end

    it 'denies a project admin viewing an email for a delivery under their own project when the flag is disabled' do
      client.client_feature.update!(use_new_communication_center: false)
      user = create(:project_admin, project: project)

      expect(described_class.new(user, email).show?).to eq(false)
    end
  end

  describe '#create?' do
    # No POST /communication_emails route exists (config/routes.rb excludes :create) -- these specs exercise
    # the policy method directly for consistency/defense-in-depth, not a reachable HTTP path.
    it 'allows a superadmin' do
      user = create(:superadmin)

      expect(described_class.new(user, CommunicationEmail).create?).to eq(true)
    end

    it 'allows a project admin scoped to their own project' do
      user = create(:project_admin, project: project)
      policy = described_class.new(user, CommunicationEmail, project_id: project.id)

      expect(policy.create?).to eq(true)
    end

    it 'denies a project admin scoped to an unrelated project' do
      user = create(:project_admin, project: project)
      policy = described_class.new(user, CommunicationEmail, project_id: other_project.id)

      expect(policy.create?).to eq(false)
    end

    it 'denies a project admin scoped to their own project when use_new_communication_center is disabled' do
      client.client_feature.update!(use_new_communication_center: false)
      user = create(:project_admin, project: project)
      policy = described_class.new(user, CommunicationEmail, project_id: project.id)

      expect(policy.create?).to eq(false)
    end

    # Regression guard: record is the bare CommunicationEmail class here (no instance yet). #campaign_id is
    # overridden elsewhere in this policy to derive from record.communication_delivery, which raises
    # NoMethodError when called on a Class rather than an instance -- create? (and feature_enabled? within
    # it) must route around that override via extras_campaign_id, never the bare #campaign_id. This same
    # trap previously broke the has_permission? wrapper here; this spec exists so a future refactor that
    # reintroduces a bare #campaign_id call in create?'s path fails loudly instead of raising at runtime.
    it 'does not raise when scoped to a campaign and the flag is enabled' do
      campaign = create(:campaign, project: project)
      user = create(:campaign_admin, campaign: campaign)
      policy = described_class.new(user, CommunicationEmail, campaign_id: campaign.id)

      expect { policy.create? }.not_to raise_error
      expect(policy.create?).to eq(true)
    end

    it 'does not raise when scoped to a campaign and the flag is disabled' do
      client.client_feature.update!(use_new_communication_center: false)
      campaign = create(:campaign, project: project)
      user = create(:campaign_admin, campaign: campaign)
      policy = described_class.new(user, CommunicationEmail, campaign_id: campaign.id)

      expect { policy.create? }.not_to raise_error
      expect(policy.create?).to eq(false)
    end
  end

  describe '#cancel?' do
    it 'allows a client admin for an email under their own client' do
      user = create(:client_admin, client: client)

      expect(described_class.new(user, email).cancel?).to eq(true)
    end

    it 'denies a client admin for an email under an unrelated client' do
      user = create(:client_admin, client: client)

      expect(described_class.new(user, other_project_email).cancel?).to eq(false)
    end

    it 'denies a client admin for an email under their own client when the flag is disabled' do
      client.client_feature.update!(use_new_communication_center: false)
      user = create(:client_admin, client: client)

      expect(described_class.new(user, email).cancel?).to eq(false)
    end
  end

  describe '#preview?' do
    it 'allows a client admin for an email under their own client' do
      user = create(:client_admin, client: client)

      expect(described_class.new(user, email).preview?).to eq(true)
    end

    it 'denies a client admin for an email under their own client when the flag is disabled' do
      client.client_feature.update!(use_new_communication_center: false)
      user = create(:client_admin, client: client)

      expect(described_class.new(user, email).preview?).to eq(false)
    end
  end

  describe '#retrigger?' do
    it 'allows a client admin for an email under their own client' do
      user = create(:client_admin, client: client)

      expect(described_class.new(user, email).retrigger?).to eq(true)
    end

    it 'denies a client admin for an email under an unrelated client' do
      user = create(:client_admin, client: client)

      expect(described_class.new(user, other_project_email).retrigger?).to eq(false)
    end

    it 'denies a client admin for an email under their own client when the flag is disabled' do
      client.client_feature.update!(use_new_communication_center: false)
      user = create(:client_admin, client: client)

      expect(described_class.new(user, email).retrigger?).to eq(false)
    end
  end

  describe '#destroy?' do
    it 'aliases #cancel?' do
      user = create(:client_admin, client: client)
      policy = described_class.new(user, email)

      expect(policy.destroy?).to eq(policy.cancel?)
    end
  end

  describe 'Scope' do
    subject(:resolved) { described_class::Scope.new(user, CommunicationEmail).resolve }

    context 'for a project admin' do
      let(:user) { create(:project_admin, project: project) }

      it 'includes emails for deliveries in their own project only' do
        expect(resolved).to include(email)
        expect(resolved).not_to include(other_project_email)
      end
    end

    context 'for a client admin' do
      let(:user) { create(:client_admin, client: client) }

      it 'includes emails for deliveries under their own client' do
        expect(resolved).to include(email)
        expect(resolved).not_to include(other_project_email)
      end

      it 'excludes emails for their own client when use_new_communication_center is disabled' do
        client.client_feature.update!(use_new_communication_center: false)

        expect(resolved).not_to include(email)
      end
    end

    context 'for a superadmin' do
      let(:user) { create(:superadmin) }

      it 'includes every email' do
        expect(resolved).to include(email, other_project_email)
      end
    end
  end
end
