# frozen_string_literal: true

require 'rails_helper'

RSpec.describe WorkshopInvitedSubject, type: :model do
  describe 'Scope bookings' do
    it 'returns all workshop invited subject except pending' do
      create(:workshop_invited_subject, status: 'pending')
      create(:workshop_invited_subject, status: 'accepted')
      create(:workshop_invited_subject, status: 'cancelled')
      create(:workshop_invited_subject, status: 'requested_cancellation')
      create(:workshop_invited_subject, status: 'requested_rescheduling')
      create(:workshop_invited_subject, status: 'rescheduled')
      create(:workshop_invited_subject, status: 'requested_cancellation_rejected')
      create(:workshop_invited_subject, status: 'requested_rescheduling_rejected')

      expect(WorkshopInvitedSubject.bookings.pluck(:status)).
        to contain_exactly('accepted', 'cancelled', 'requested_cancellation',
                           'requested_rescheduling', 'rescheduled',
                           'requested_cancellation_rejected',
                           'requested_rescheduling_rejected')
    end
  end

  describe 'Invite emails' do
    let(:campaign) { create(:campaign) }
    let(:subject) { create(:user, project: campaign.project) }
    let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: subject) }
    let(:campaign_id) { campaign.id }
    let(:workshop) { create(:workshop, campaign_id: campaign_id) }
    let!(:workshop_invite) { create(:workshop_invite, workshops: [workshop], campaign: campaign) }
    let!(:communication) do
      create(:communication, kind: :workshop_invite,
        campaign_id: campaign.id, project_id: campaign.project.id, client_id: campaign.project.parent.id)
    end

    let!(:prework_user_assessment) do
      create(:user_assessment,
             campaign: campaign,
             subject: subject,
             evaluator: subject,
             prework: true,
             status: 'not_started')
    end

    let!(:campaign_assessment) do
      create(:campaign_assessment,
             assessment: prework_user_assessment.assessment,
             campaign: campaign,
             prework: true,
             workshop_activity: true)
    end

    context 'when prework requires completion' do
      before do
        campaign.campaign_options.update!(workshop_invite_requires_prework_completion: true)
      end

      let!(:workshop_invited_subject) do
        create(:workshop_invited_subject,
               status: 'pending',
               user: subject,
               workshop_invite: workshop_invite)
      end

      it 'does not send email if prework is not completed' do
        expect do
          create(:workshop_invited_subject,
                 status: 'pending',
                 user: subject,
                 workshop_invite: workshop_invite)
        end.not_to change(communication.reload.emails, :count)
      end

      it 'sends email if prework is completed' do
        expect do
          prework_user_assessment.update!(status: 'completed')
        end.to change(communication.emails, :count).by(1)

        last_email = CommunicationEmail.last
        expect(last_email.user).to eq(subject)
        expect(last_email.communication).to eq(communication)
      end
    end

    context 'when prework completion is not required' do
      before do
        campaign.campaign_options.update!(workshop_invite_requires_prework_completion: false)
      end

      it 'sends email even if prework is not completed' do
        expect do
          create(:workshop_invited_subject,
                 status: 'pending',
                 user: subject,
                 workshop_invite: workshop_invite)
        end.to change(communication.reload.emails, :count).by(1)

        last_email = CommunicationEmail.last
        expect(last_email.user).to eq(subject)
        expect(last_email.communication).to eq(communication)
      end
    end
  end
end
