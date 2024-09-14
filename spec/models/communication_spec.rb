# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Communication, type: :model do
  context 'Associations' do
    it { should have_many(:emails) }
    it { should belong_to(:assessment) }
    it { should belong_to(:owner) }
    it { should belong_to(:project) }
    it { should belong_to(:sub_campaign) }
    it { should belong_to(:end_level) }
    it { should belong_to(:campaign) }
    it { should have_and_belong_to_many(:copy_memberships) }
    it { should have_and_belong_to_many(:memberships) }
  end

  context 'Callbacks' do
    describe '#create_invitations_email' do
      before do
        @invite = build(:communication)
      end
      context 'when communication is invitation' do
        context 'when there are any selected memberships' do
          it 'creates emails with count equal to the count of selected_memberships' do
            @invite.save
            expect(@invite.emails.size).to eq(@invite.selected_memberships.size)
          end
        end
        context 'when there are no selected memberships' do
          it 'does not create any CommunicationEmail' do
            @invite.end_level_id = nil
            expect { @invite.save }.to change { @invite.emails.size }.by(0)
          end
        end
      end

      context 'when communication is not invitation' do
        it 'does not create new CommunicationEmail' do
          @invite.kind = 'reminder'
          @invite.save
          expect(@invite.emails.size).to eq(0)
        end
      end
    end
  end

  context '#current_memberships_ids' do
    let!(:sub_campaign1) { create(:sub_campaign) }
    let!(:sub_campaign2) { create(:sub_campaign, parent: sub_campaign1.parent) }
    let!(:sub_campaign_membership1) { create(:membership, client: sub_campaign1) }
    let!(:sub_campaign_membership2) { create(:membership, client: sub_campaign2) }
    let!(:communication1) do
      create(:communication, client_id: sub_campaign1.tte.id, owner_id: sub_campaign1.tte.id,
             project_id: sub_campaign1.project.id, campaign_id: sub_campaign1.campaign.id,
             sub_campaign_id: sub_campaign1.id, end_level_id: sub_campaign1.id)
    end
    let!(:communication2) do
      create(:communication, client_id: sub_campaign1.tte.id, owner_id: sub_campaign1.tte.id,
             project_id: sub_campaign1.project.id, campaign_id: sub_campaign1.campaign.id,
             end_level_id: sub_campaign1.campaign.id)
    end

    context 'if end_level is client end_level' do
      it 'eq to selected_memberships_ids' do
        expect(communication1.current_memberships_ids).to eq(communication1.selected_memberships_ids)
      end
    end
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
