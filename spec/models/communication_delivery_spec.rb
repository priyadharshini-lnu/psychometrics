# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CommunicationDelivery, type: :model do
  context 'Associations' do
    it { should belong_to(:communication_template) }
    it { should belong_to(:campaign) }
    it { should belong_to(:project).class_name('Client') }
    it { should belong_to(:created_by) }
    it { should belong_to(:updated_by) }
    it { should have_many(:emails).class_name('CommunicationEmail').dependent(:restrict_with_error) }
    it { should have_many(:communication_delivery_users).dependent(:destroy) }
    it { should have_many(:selected_users).through(:communication_delivery_users).source(:user) }
  end

  describe 'creation' do
    it 'is valid with the factory defaults' do
      expect(create(:communication_delivery)).to be_persisted
    end

    it 'requires a campaign unless the template kind is magic_link_email' do
      template = create(:communication_template, kind: :invitation, level: :platform)
      delivery = build(:communication_delivery, communication_template: template, campaign: nil)

      expect(delivery).not_to be_valid
      expect(delivery.errors[:campaign]).to be_present
    end

    it 'requires a project when the template kind is magic_link_email' do
      template = create(:communication_template, kind: :magic_link_email, level: :project)
      delivery = build(:communication_delivery, communication_template: template, campaign: nil)

      expect(delivery).not_to be_valid
      expect(delivery.errors[:project]).to be_present
    end

    it 'is valid for magic_link_email with a project and no campaign' do
      delivery = build(:communication_delivery, :magic_link_email)

      expect(delivery).to be_valid
      expect(delivery.campaign).to be_nil
    end

    context 'for a project-scopable kind (e.g. idp_template_assigned)' do
      it 'is valid scoped to a campaign only' do
        delivery = build(:communication_delivery, :idp_template_assigned)

        expect(delivery).to be_valid
      end

      it 'is valid scoped to a project only' do
        delivery = build(:communication_delivery, :idp_template_assigned, :project_scoped)

        expect(delivery).to be_valid
        expect(delivery.campaign).to be_nil
        expect(delivery.project).to be_present
      end

      it 'is invalid when neither campaign nor project is set' do
        template = create(:communication_template, kind: :idp_template_assigned, level: :platform)
        delivery = build(:communication_delivery, communication_template: template, campaign: nil)

        expect(delivery).not_to be_valid
        expect(delivery.errors[:base]).to include('campaign or project is required')
      end

      it 'is invalid when both campaign and project are set' do
        delivery = build(:communication_delivery, :idp_template_assigned)
        delivery.project = create(:project, parent: create(:tenancy))

        expect(delivery).not_to be_valid
        expect(delivery.errors[:base]).to include('campaign and project cannot both be set')
      end
    end
  end

  describe '.active_for_kind' do
    let(:client) { create(:tenancy) }
    let(:project) { create(:project, parent: client) }
    let(:campaign) { create(:campaign, project: project) }

    # active_for_kind only ever returns a delivery when the client has opted into
    # use_new_communication_center -- see CommunicationDelivery.rollout_active?. Enabled here so the
    # rest of this describe block can focus on the campaign/project scoping logic; the flag-gating
    # behavior itself gets its own dedicated examples below.
    before { client.client_feature.update!(use_new_communication_center: true) }

    it 'returns nil when no active delivery exists' do
      expect(CommunicationDelivery.active_for_kind('idp_template_assigned', campaign_id: campaign.id)).to be_nil
    end

    it 'returns the campaign-scoped delivery when only one exists' do
      delivery = create(:communication_delivery, :idp_template_assigned,
                        client: client, project: project, campaign: campaign)

      found = CommunicationDelivery.active_for_kind(
        'idp_template_assigned', campaign_id: campaign.id, project_id: project.id
      )
      expect(found).to eq(delivery)
    end

    it 'falls back to the project-scoped delivery when no campaign-scoped one exists' do
      delivery = create(:communication_delivery, :idp_template_assigned, :project_scoped,
                        client: client, project: project)

      found = CommunicationDelivery.active_for_kind(
        'idp_template_assigned', campaign_id: campaign.id, project_id: project.id
      )
      expect(found).to eq(delivery)
    end

    it 'prefers the campaign-scoped delivery over a project-scoped one' do
      project_delivery = create(:communication_delivery, :idp_template_assigned, :project_scoped,
                                client: client, project: project)
      campaign_delivery = create(:communication_delivery, :idp_template_assigned,
                                 client: client, project: project, campaign: campaign)

      found = CommunicationDelivery.active_for_kind(
        'idp_template_assigned', campaign_id: campaign.id, project_id: project.id
      )
      expect(found).to eq(campaign_delivery)
      expect(found).not_to eq(project_delivery)
    end

    it 'ignores non-active deliveries' do
      delivery = create(:communication_delivery, :idp_template_assigned,
                        client: client, project: project, campaign: campaign)
      delivery.update!(status: :cancelled)

      found = CommunicationDelivery.active_for_kind('idp_template_assigned', campaign_id: campaign.id)
      expect(found).to be_nil
    end

    context 'when use_new_communication_center is disabled for the client' do
      before { client.client_feature.update!(use_new_communication_center: false) }

      it 'returns nil even though an active campaign-scoped delivery exists' do
        create(:communication_delivery, :idp_template_assigned, client: client, project: project, campaign: campaign)

        found = CommunicationDelivery.active_for_kind('idp_template_assigned', campaign_id: campaign.id)
        expect(found).to be_nil
      end

      it 'returns nil even though an active project-scoped delivery exists' do
        create(:communication_delivery, :idp_template_assigned, :project_scoped, client: client, project: project)

        found = CommunicationDelivery.active_for_kind(
          'idp_template_assigned', campaign_id: campaign.id, project_id: project.id
        )
        expect(found).to be_nil
      end
    end
  end

  describe '.active_for_campaign_assessment_group' do
    let(:client) { create(:tenancy) }
    let(:project) { create(:project, parent: client) }
    let(:campaign) { create(:campaign, project: project) }

    before { client.client_feature.update!(use_new_communication_center: true) }

    it 'returns the delivery matching both campaign and assessment group' do
      group_a = create(:campaign_assessment_group, campaign: campaign)
      group_b = create(:campaign_assessment_group, campaign: campaign)
      delivery_a = create(:communication_delivery, :workshop_booked, client: client, project: project,
                                                                         campaign: campaign,
                                                                         campaign_assessment_group: group_a)
      create(:communication_delivery, :workshop_booked, client: client, project: project, campaign: campaign,
                                                            campaign_assessment_group: group_b)

      found = CommunicationDelivery.active_for_campaign_assessment_group(
        'workshop_booked', campaign_id: campaign.id, campaign_assessment_group_id: group_a.id
      )
      expect(found).to eq(delivery_a)
    end

    it 'returns nil when no delivery matches the given assessment group' do
      group_a = create(:campaign_assessment_group, campaign: campaign)
      group_b = create(:campaign_assessment_group, campaign: campaign)
      create(:communication_delivery, :workshop_booked, client: client, project: project, campaign: campaign,
                                                            campaign_assessment_group: group_b)

      found = CommunicationDelivery.active_for_campaign_assessment_group(
        'workshop_booked', campaign_id: campaign.id, campaign_assessment_group_id: group_a.id
      )
      expect(found).to be_nil
    end

    it 'returns nil when use_new_communication_center is disabled for the client' do
      client.client_feature.update!(use_new_communication_center: false)
      group = create(:campaign_assessment_group, campaign: campaign)
      create(:communication_delivery, :workshop_booked, client: client, project: project, campaign: campaign,
                                                            campaign_assessment_group: group)

      found = CommunicationDelivery.active_for_campaign_assessment_group(
        'workshop_booked', campaign_id: campaign.id, campaign_assessment_group_id: group.id
      )
      expect(found).to be_nil
    end
  end

  describe 'nested attributes for communication_delivery_users' do
    it 'creates delivery users through communication_delivery_users_attributes' do
      client = create(:tenancy)
      project = create(:project, parent: client)
      campaign = create(:campaign, project: project)
      user = create(:user)
      create(:campaign_user, campaign: campaign, user: user)

      delivery = create(
        :communication_delivery,
        client: client, project: project, campaign: campaign, recipients: :selected,
        communication_delivery_users_attributes: [{ user_id: user.id }]
      )

      expect(delivery.selected_users).to contain_exactly(user)
    end
  end

  describe 'delegation' do
    it 'delegates kind to the communication_template' do
      delivery = create(:communication_delivery)

      expect(delivery.kind).to eq(delivery.communication_template.kind)
    end

    it 'still loads a platform-level (tenant_id: nil) template under real tenant scoping' do
      client = create(:tenancy)
      project = create(:project, parent: client)
      campaign = create(:campaign, project: project)
      template = create(:communication_template, kind: :invitation, level: :platform, client: nil, project: nil,
                                                   campaign: nil)
      delivery = create(:communication_delivery, communication_template: template, client: client, project: project,
                                                   campaign: campaign)

      # Regression coverage: acts_as_tenant's default scope would otherwise silently return nil for
      # this belongs_to once ActsAsTenant.current_tenant is set (as it is for every real admin request
      # and, via acts_as_tenant/sidekiq, for background jobs enqueued from one), breaking `kind`
      # delegation and anything downstream (dispatch, mailer rendering) that relies on it.
      ActsAsTenant.with_tenant(client) do
        expect(CommunicationDelivery.find(delivery.id).kind).to eq('invitation')
      end
    end
  end

  it 'has the dispatch columns' do
    delivery = create(:communication_delivery)

    expect(delivery).to respond_to(:stop_reminder_datetime, :last_ran_at, :next_run_at)
  end

  describe 'translations' do
    it 'translates subject and body' do
      I18n.with_locale(:en) do
        delivery = create(:communication_delivery, subject_en: 'Hello', body_en: 'Welcome')

        I18n.with_locale(:es) do
          delivery.subject = 'Hola'
          delivery.body = 'Bienvenido'
          delivery.save
        end

        expect(delivery.subject).to eq('Hello')
        expect(delivery.body).to eq('Welcome')

        I18n.with_locale(:es) do
          expect(delivery.subject).to eq('Hola')
          expect(delivery.body).to eq('Bienvenido')
        end
      end
    end
  end
end
