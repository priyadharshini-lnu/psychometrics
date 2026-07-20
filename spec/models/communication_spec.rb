# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Communication, type: :model do
  context 'Associations' do
    it { should have_many(:emails) }
    it { should belong_to(:assessment) }
    it { should belong_to(:project) }
    it { should belong_to(:sub_campaign) }
    it { should belong_to(:end_level) }
    it { should belong_to(:campaign) }
    it { should have_and_belong_to_many(:copy_memberships) }
    it { should have_and_belong_to_many(:memberships) }
  end

  context '#selected_campaign_users' do
    let(:campaign) { create(:campaign) }
    let(:project) { campaign.project }
    let!(:campaign_user1) { create(:campaign_user, campaign: campaign) }
    let!(:campaign_user2) { create(:campaign_user, campaign: campaign) }

    let!(:communication) do
      create(:communication,
             campaign_id: campaign.id, project_id: project.id, client_id: project.parent.id)
    end

    it 'return active project campaign users' do
      expect(communication.selected_campaign_users).to include(campaign_user1, campaign_user2)

      campaign_user2.update(active: false)

      expect(communication.selected_campaign_users).to include(campaign_user1)
      expect(communication.selected_campaign_users).not_to include(campaign_user2)
    end

    it 'exclude disabled users' do
      expect(communication.selected_campaign_users).to include(campaign_user1, campaign_user2)

      campaign_user2.user.update(disabled: true)

      expect(communication.selected_campaign_users).to include(campaign_user1)
      expect(communication.selected_campaign_users).not_to include(campaign_user2)
    end

    it 'return only selected recipients' do
      communication.update(recipients: :selected)

      communication.communications_users.create(user: campaign_user1.user)

      expect(communication.selected_campaign_users).to include(campaign_user1)
      expect(communication.selected_campaign_users).not_to include(campaign_user2)
    end
  end

  context '#not_invited_to_project_current_memberships' do
    let(:campaign) { create(:campaign) }
    let(:project) { campaign.project }
    let!(:campaign_user1) { create(:campaign_user, campaign: campaign) }
    let!(:campaign_user2) { create(:campaign_user, campaign: campaign) }

    let!(:communication) do
      create(:communication,
             campaign_id: campaign.id, project_id: project.id, client_id: project.parent.id)
    end

    it 'return active project campaign users which are not invited already' do
      expect(communication.not_invited_to_project_current_memberships).to include(campaign_user1, campaign_user2)

      campaign_user2.user.update(already_invited: true)

      expect(communication.not_invited_to_project_current_memberships).to include(campaign_user1)
      expect(communication.not_invited_to_project_current_memberships).not_to include(campaign_user2)
    end
  end

  context '#campaign_users_not_recently_invited' do
    let(:campaign) { create(:campaign) }
    let(:project) { campaign.project }
    let!(:campaign_user1) { create(:campaign_user, campaign: campaign) }
    let!(:campaign_user2) { create(:campaign_user, campaign: campaign) }

    let!(:communication) do
      create(:communication, kind: :reminder,
        campaign_id: campaign.id, project_id: project.id, client_id: project.parent.id)
    end

    let!(:invitation_communication) do
      create(:communication, kind: :invitation,
        campaign_id: campaign.id, project_id: project.id, client_id: project.parent.id)
    end

    it 'returns users who have not been invited in the last 24 hours' do
      create(:communication_email, sent_at: 20.hours.ago, campaign_user: campaign_user2,
communication: invitation_communication)

      create(:communication_email, sent_at: 20.hours.ago, campaign_user: campaign_user2,
            communication: communication)

      result = communication.campaign_users_not_recently_invited

      expect(result).to include(campaign_user1)
      expect(result).not_to include(campaign_user2)
    end

    it 'returns users who have been invited before 24 hours' do
      create(:communication_email, sent_at: 25.hours.ago, campaign_user: campaign_user2,
communication: invitation_communication)

      result = communication.campaign_users_not_recently_invited

      expect(result).to include(campaign_user1)
      expect(result).to include(campaign_user2)
    end

    it 'returns users who have no invitation emails' do
      result = communication.campaign_users_not_recently_invited

      expect(result).to include(campaign_user1)
      expect(result).to include(campaign_user2)
    end
  end
end
