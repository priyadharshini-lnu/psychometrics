require 'rails_helper'

RSpec.describe CommunicationEmail, type: :model do

  context 'Associations' do
    it { should belong_to(:membership) }
    it { should belong_to(:communication) }
  end

  context 'Scopes' do
    describe '.for_user(user_id)' do
      before do
        @client = create(:tenancy)
        @project = create(:project_base )
        @memberships = create(:membership, client_id: @project.id, user: create(:user))
        @user = @memberships.user
        @communication = create(:communication, client_id: @project.id)
      end

      context 'when user has some CommunicationEmail' do
        it 'returns those emails' do
          expect(CommunicationEmail.for_user(@user.id).size).to eq(CommunicationEmail.joins(:membership).where(memberships: { user_id: @user.id}).size)
        end
      end
      context 'when there are some emails for other users' do
        it 'returns only emails ids for current user' do
          expect(CommunicationEmail.for_user(@user.id).size).to_not eq(@communication.memberships.size)
        end
      end
    end

    describe '.not_invitation_emails_for(user_id)' do
      before do
        project = create(:project_base )
        @membership = create(:membership, client_id: project.id, user: create(:user))
        @communication = create(:communication, client_id: project.id)
      end
      context 'when there are some communication emails for user' do
        it 'returns only ids of non-invitations communication emails' do
          expect(CommunicationEmail.not_invitation_emails_for(@membership.user.id).size).to eq(@membership.communication_emails.joins(:communication).where.not(communications: { kind: 'invitation' }).size)
        end
      end
    end
  end
end