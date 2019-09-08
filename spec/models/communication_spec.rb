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
end
