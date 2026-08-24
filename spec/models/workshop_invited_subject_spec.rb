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

  describe 'Scope in_campaign_assessment_group' do
    let!(:campaign1) { create(:campaign) }
    let!(:campaign2) { create(:campaign) }
    let!(:assessment_group1) { create(:campaign_assessment_group, campaign: campaign1) }
    let!(:assessment_group2) { create(:campaign_assessment_group, campaign: campaign1) }
    let!(:assessment_group3) { create(:campaign_assessment_group, campaign: campaign2) }

    let!(:user1) { create(:user) }
    let!(:user2) { create(:user) }
    let!(:user3) { create(:user) }

    let!(:workshop_invite1) do
      create(:workshop_invite, campaign: campaign1, campaign_assessment_group: assessment_group1)
    end
    let!(:workshop_invite2) do
      create(:workshop_invite, campaign: campaign1, campaign_assessment_group: assessment_group2)
    end
    let!(:workshop_invite3) do
      create(:workshop_invite, campaign: campaign2, campaign_assessment_group: assessment_group3)
    end

    let!(:subject1) { create(:workshop_invited_subject, workshop_invite: workshop_invite1, user: user1) }
    let!(:subject2) { create(:workshop_invited_subject, workshop_invite: workshop_invite2, user: user2) }
    let!(:subject3) { create(:workshop_invited_subject, workshop_invite: workshop_invite3, user: user3) }

    it 'returns only subjects in the specified campaign and assessment group' do
      results = WorkshopInvitedSubject.in_campaign_assessment_group(campaign1.id, assessment_group1.id)

      expect(results).to contain_exactly(subject1)
      expect(results).not_to include(subject2, subject3)
    end

    it 'returns empty when no subjects match the campaign and assessment group' do
      non_existent_campaign_id = 99_999
      non_existent_assessment_group_id = 99_999

      results = WorkshopInvitedSubject.in_campaign_assessment_group(
        non_existent_campaign_id,
        non_existent_assessment_group_id
      )

      expect(results).to be_empty
    end

    it 'filters correctly by campaign even with same assessment group id' do
      results = WorkshopInvitedSubject.in_campaign_assessment_group(campaign2.id, assessment_group3.id)

      expect(results).to contain_exactly(subject3)
      expect(results).not_to include(subject1, subject2)
    end

    context 'when multiple subjects exist in the same assessment group' do
      let!(:subject4) { create(:workshop_invited_subject, workshop_invite: workshop_invite1, user: user2) }
      let!(:subject5) { create(:workshop_invited_subject, workshop_invite: workshop_invite1, user: user3) }

      it 'returns all subjects in the specified assessment group' do
        results = WorkshopInvitedSubject.in_campaign_assessment_group(campaign1.id, assessment_group1.id)

        expect(results).to contain_exactly(subject1, subject4, subject5)
      end
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

      context 'when an active CommunicationDelivery exists for the matching assessment group' do
        let!(:delivery) do
          create(:communication_delivery, :workshop_invite, client: campaign.project.parent,
                                                                project: campaign.project, campaign: campaign,
                                                                campaign_assessment_group:
                                                                  workshop_invite.campaign_assessment_group)
        end

        context 'and use_new_communication_center is disabled for the client (default)' do
          it 'sends the legacy email only -- the delivery is not usable without the flag' do
            expect do
              create(:workshop_invited_subject, status: 'pending', user: subject, workshop_invite: workshop_invite)
            end.to change(CommunicationEmail, :count).by(1)

            expect(CommunicationEmail.where(communication_delivery: delivery)).to be_empty
          end
        end

        context 'and use_new_communication_center is enabled for the client' do
          before { campaign.project.parent.client_feature.update!(use_new_communication_center: true) }

          it 'sends the delivery-sourced email only -- the flag suppresses the legacy send' do
            expect do
              create(:workshop_invited_subject, status: 'pending', user: subject, workshop_invite: workshop_invite)
            end.to change(CommunicationEmail, :count).by(1)

            delivery_email = CommunicationEmail.find_by(communication_delivery: delivery)
            expect(delivery_email.workshop_invite).to eq(workshop_invite)
            expect(communication.reload.emails).to be_empty
          end

          it 'does not double-send on a second non-resent call, since the guard covers both sources together' do
            workshop_invited_subject = create(:workshop_invited_subject, status: 'pending', user: subject,
                                                                            workshop_invite: workshop_invite)

            expect do
              WorkshopInvites::SendEmail.call!(workshop_invited_subject)
            end.not_to change(CommunicationEmail, :count)
          end

          it 'sends again on an explicit resend (resend bypasses the guard by design)' do
            workshop_invited_subject = create(:workshop_invited_subject, status: 'pending', user: subject,
                                                                            workshop_invite: workshop_invite)

            expect do
              Workshops::InviteRequest::ResendRequest.call!([workshop_invited_subject.id])
            end.to change(CommunicationEmail, :count).by(1)
          end
        end
      end

      context 'when the active CommunicationDelivery is for a different assessment group' do
        before { campaign.project.parent.client_feature.update!(use_new_communication_center: true) }

        let!(:delivery) do
          other_group = create(:campaign_assessment_group, campaign: campaign)
          create(:communication_delivery, :workshop_invite, client: campaign.project.parent,
                                                                project: campaign.project, campaign: campaign,
                                                                campaign_assessment_group: other_group)
        end

        it 'does not create a delivery-sourced email even with the flag enabled' do
          create(:workshop_invited_subject, status: 'pending', user: subject, workshop_invite: workshop_invite)

          expect(CommunicationEmail.where(communication_delivery: delivery)).to be_empty
        end
      end
    end
  end
end
