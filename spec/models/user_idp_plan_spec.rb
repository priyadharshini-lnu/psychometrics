# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserIdpPlan, type: :model do
  describe '#schedule_idp_assigned_notification' do
    let(:user) { create(:user) }
    let(:campaign_user) { create(:campaign_user, user: user) }
    let(:campaign) { campaign_user.campaign }
    let(:communication) { create(:communication, kind: :idp_template_assigned, campaign_id: campaign.id) }
    let(:user_idp_plan) do
      build(:user_idp_plan, user: user, campaign: campaign)
    end

    context 'when communication exists' do
      before { communication }

      it 'creates communication email with the resource' do
        expect do
          user_idp_plan.save!
        end.to change(CommunicationEmail, :count).by(1)

        communication_email = CommunicationEmail.last
        expect(communication_email.communication).to eq(communication)
        expect(communication_email.user).to eq(user)
        expect(communication_email.campaign_user).to eq(campaign_user)
        expect(communication_email.communication_email_resources.first.resource).to eq(user_idp_plan)
      end
    end

    context 'when no communication exists' do
      it 'does not create any communication emails' do
        expect do
          user_idp_plan.save!
        end.not_to change(CommunicationEmail, :count)
      end
    end

    context 'when communication email already exists' do
      before do
        communication
        email = create(:communication_email,
                       communication: communication,
                       user: user,
                       campaign_user: campaign_user)
        create(:communication_email_resource,
               communication_email: email,
               resource: user_idp_plan)
      end

      it 'does not create another communication email' do
        expect do
          user_idp_plan.save!
        end.not_to change(CommunicationEmail, :count)
      end
    end
  end

  describe '#schedule_idp_status_notification' do
    let(:user) { create(:user) }
    let(:campaign_user) { create(:campaign_user, user: user) }
    let(:user_idp_plan) do
      create(:user_idp_plan, user: user, campaign_id: campaign_user.campaign_id, status: :pending_approval)
    end

    context 'when plan is approved' do
      let(:communication) { create(:communication, kind: :idp_template_approved, campaign_id: user_idp_plan.campaign_id) }

      context 'when communication exists' do
        before { communication }

        it 'creates communication email with the resource' do
          expect do
            user_idp_plan.update!(status: :approved)
          end.to change(CommunicationEmail, :count).by(1)

          communication_email = CommunicationEmail.last
          expect(communication_email.communication).to eq(communication)
          expect(communication_email.user).to eq(user)
          expect(communication_email.campaign_user).to eq(campaign_user)
          expect(communication_email.communication_email_resources.first.resource).to eq(user_idp_plan)
        end
      end

      context 'when no communication exists' do
        it 'does not create any communication emails' do
          expect do
            user_idp_plan.update!(status: :approved)
          end.not_to change(CommunicationEmail, :count)
        end
      end

      context 'when communication email already exists' do
        before do
          communication
          email = create(:communication_email,
                         communication: communication,
                         user: user,
                         campaign_user: campaign_user)
          create(:communication_email_resource,
                 communication_email: email,
                 resource: user_idp_plan)
        end

        it 'does not create another communication email' do
          expect do
            user_idp_plan.update!(status: :approved)
          end.not_to change(CommunicationEmail, :count)
        end
      end
    end

    context 'when plan is rejected' do
      let(:communication) { create(:communication, kind: :idp_template_rejected, campaign_id: user_idp_plan.campaign_id) }

      context 'when communication exists' do
        before { communication }

        it 'creates communication email with the resource' do
          expect do
            user_idp_plan.update!(status: :rejected)
          end.to change(CommunicationEmail, :count).by(1)

          communication_email = CommunicationEmail.last
          expect(communication_email.communication).to eq(communication)
          expect(communication_email.user).to eq(user)
          expect(communication_email.campaign_user).to eq(campaign_user)
          expect(communication_email.communication_email_resources.first.resource).to eq(user_idp_plan)
        end
      end
    end
  end
end
