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
end
