# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserIdpPlan, type: :model do
  describe '#schedule_idp_assigned_notification' do
    let(:user) { create(:user) }
    let(:campaign_user) { create(:campaign_user, user: user) }
    let(:campaign) { campaign_user.campaign }
    let(:communication) { create(:communication, kind: :idp_assigned, campaign_id: campaign.id) }
    let(:user_idp_plan) do
      build(:user_idp_plan, user: user, campaign: campaign)
    end

    context 'when communication exists' do
      before { communication }

      it 'creates communication email with the resource' do
        expect {
          user_idp_plan.save!
        }.to change(CommunicationEmail, :count).by(1)

        communication_email = CommunicationEmail.last
        expect(communication_email.communication).to eq(communication)
        expect(communication_email.user).to eq(user)
        expect(communication_email.campaign_user).to eq(campaign_user)
        expect(communication_email.communication_email_resources.first.resource).to eq(user_idp_plan)
      end
    end

    context 'when no communication exists' do
      it 'does not create any communication emails' do
        expect {
          user_idp_plan.save!
        }.not_to change(CommunicationEmail, :count)
      end
    end

    context 'when communication email already exists' do
      before do
        communication
        email = create(:communication_email,
          communication: communication,
          user: user,
          campaign_user: campaign_user
        )
        create(:communication_email_resource,
          communication_email: email,
          resource: user_idp_plan
        )
      end

      it 'does not create another communication email' do
        expect {
          user_idp_plan.save!
        }.not_to change(CommunicationEmail, :count)
      end
    end
  end
end
