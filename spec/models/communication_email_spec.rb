# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CommunicationEmail, type: :model do
  context 'Associations' do
    it { should belong_to(:membership) }
    it { should belong_to(:communication) }
    it { should have_many(:communication_email_resources).inverse_of(:communication_email).dependent(:destroy) }
  end

  describe 'status' do
    it {
      should define_enum_for(:status).
        with_values(pending: 0, queued: 1, sent: 2, failed: 3, skipped: 4, cancelled: 5)
    }

    it 'defaults to pending' do
      # CommunicationEmail#redeliver! (after_commit on: :create) immediately advances a
      # persisted row to :queued, so check the unsaved default instead of a created record.
      expect(CommunicationEmail.new.status).to eq('pending')
    end
  end

  describe 'occurrence uniqueness' do
    let(:client) { create(:tenancy) }
    let(:project) { create(:project, parent: client) }
    let(:campaign) { create(:campaign, project: project) }
    let(:delivery) { create(:communication_delivery, client: client, project: project, campaign: campaign) }
    let(:user) { create(:user) }
    let(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }

    it 'rejects a duplicate (delivery, user, occurrence_key) triple' do
      CommunicationEmail.create!(communication_delivery: delivery, campaign_user: campaign_user, user: user,
                                 occurrence_key: 'once')

      expect do
        CommunicationEmail.create!(communication_delivery: delivery, campaign_user: campaign_user, user: user,
                                   occurrence_key: 'once')
      end.to raise_error(ActiveRecord::RecordNotUnique)
    end

    it 'does not treat a nil occurrence_key (e.g. legacy communication-sourced emails) as colliding' do
      communication = create(:communication)

      expect do
        create(:communication_email, communication: communication, user: user)
        create(:communication_email, communication: communication, user: user)
      end.not_to raise_error
    end
  end

  describe 'legacy suppression guard' do
    let(:client) { create(:tenancy) }
    let(:project) { create(:project, parent: client) }
    let(:campaign) { create(:campaign, project: project) }
    let(:communication) { create(:communication, client: client) }

    it 'does not persist a legacy-sourced email when use_new_communication_center is enabled' do
      client.client_feature.update!(use_new_communication_center: true)

      email = CommunicationEmail.create(communication: communication, membership: create(:membership))

      expect(email).not_to be_persisted
    end

    it 'persists a legacy-sourced email when use_new_communication_center is disabled' do
      email = CommunicationEmail.create(communication: communication, membership: create(:membership))

      expect(email).to be_persisted
    end

    it 'does not suppress new communication-center (delivery-sourced) emails' do
      client.client_feature.update!(use_new_communication_center: true)
      delivery = create(:communication_delivery, client: client, project: project, campaign: campaign)
      campaign_user = create(:campaign_user, campaign: campaign)

      email = CommunicationEmail.create(communication_delivery: delivery, campaign_user: campaign_user,
                                        user: campaign_user.user)

      expect(email).to be_persisted
    end
  end

  context 'Scopes' do
    describe '.sent' do
      it 'returns only emails with status sent' do
        communication = create(:communication)
        sent_email = create(:communication_email, communication: communication)
        sent_email.update!(status: :sent)
        create(:communication_email, communication: communication)

        expect(CommunicationEmail.sent).to contain_exactly(sent_email)
      end
    end

    describe '.for_user(user_id)' do
      before do
        @client = create(:tenancy)
        @project = create(:project_base)
        @memberships = create(:membership, client_id: @project.id, user: create(:user))
        @user = @memberships.user
        @communication = create(:communication, client_id: @project.id)
      end

      context 'when user has some CommunicationEmail' do
        it 'returns those emails' do
          expect(CommunicationEmail.for_user(@user.id).size).
            to eq(CommunicationEmail.joins(:membership).where(memberships: { user_id: @user.id }).size)
        end
      end
      context 'when there are some emails for other users' do
        it 'returns only emails ids for current user' do
          expect(CommunicationEmail.for_user(@user.id).size).to_not eq(@communication.memberships.size)
        end
      end
    end
  end
end
