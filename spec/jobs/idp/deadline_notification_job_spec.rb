# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Idp::DeadlineNotificationJob, type: :job do
  describe '#perform' do
    let(:user) { create(:user) }
    let(:campaign) { create(:campaign) }
    let(:campaign_user) { create(:campaign_user, user: user, campaign_id: campaign.id) }
    let(:idp_template) { create(:idp_template) }
    let!(:user_idp_plan) do
      create(:user_idp_plan,
             user: user,
             campaign_id: campaign.id,
             idp_template: idp_template,
             approval_status: :approved,
             end_date: 1.day.ago)
    end
    let!(:user_idp_development_action) { create(:user_idp_development_action, user_idp_plan: user_idp_plan) }

    context 'when checking IDP deadlines' do
      let!(:idp_communication) do
        create(:communication, campaign_id: campaign.id, kind: :idp_deadline_missed, client: campaign.project.client)
      end

      it 'sends notification for expired plans' do
        expect do
          described_class.perform_now
        end.to change(CommunicationEmail, :count).by(1)

        email = CommunicationEmail.last
        expect(email.communication).to eq(idp_communication)
        expect(email.communication_email_resources.first.resource).to eq(user_idp_plan)
      end

      it 'does not send notifications for active plans' do
        user_idp_plan.update!(end_date: 1.day.from_now)

        expect do
          described_class.perform_now
        end.not_to change(CommunicationEmail, :count)
      end

      it 'does not send notifications for plans without end date' do
        user_idp_plan.update!(end_date: nil)

        expect do
          described_class.perform_now
        end.not_to change(CommunicationEmail, :count)
      end

      it 'does not send duplicate notifications' do
        # Create a previous notification
        idp_communication.create_communication_email_with_resources(
          { user: user, campaign_user: campaign_user },
          user_idp_plan
        )

        expect do
          described_class.perform_now
        end.not_to change(CommunicationEmail, :count)
      end

      context 'when an active CommunicationDelivery exists' do
        let(:project) { campaign.project }
        let(:client) { project.client }
        let!(:delivery) do
          create(:communication_delivery, :idp_deadline_missed, client: client, project: project, campaign: campaign)
        end

        before { client.client_feature.update!(use_new_communication_center: true) }

        it 'sends a notification sourced from the delivery only -- the flag suppresses the legacy send' do
          expect do
            described_class.perform_now
          end.to change(CommunicationEmail, :count).by(1)

          expect(CommunicationEmail.where(communication_delivery: delivery).count).to eq(1)
          expect(idp_communication.reload.emails).to be_empty
        end

        it 'does not send a duplicate delivery-sourced notification on a repeat run' do
          described_class.perform_now

          expect do
            described_class.perform_now
          end.not_to change(CommunicationEmail, :count)
        end
      end
    end

    context 'when checking development action deadlines' do
      let!(:development_action_communication) do
        create(:communication, campaign_id: campaign.id, kind: :development_action_deadline_missed,
                                client: campaign.project.client)
      end

      let!(:expired_action) do
        create(:user_idp_development_action,
               user_idp_plan: user_idp_plan,
               end_date_time: 1.day.ago,
               progress: 50)
      end

      let!(:completed_action) do
        create(:user_idp_development_action,
               user_idp_plan: user_idp_plan,
               end_date_time: 1.day.ago,
               progress: 100)
      end

      let!(:active_action) do
        create(:user_idp_development_action,
               user_idp_plan: user_idp_plan,
               end_date_time: 1.day.from_now,
               progress: 50)
      end

      it 'sends notification for expired and incomplete actions' do
        expect do
          described_class.perform_now
        end.to change(CommunicationEmail, :count).by(1)

        email = CommunicationEmail.last
        expect(email.communication).to eq(development_action_communication)
        expect(email.communication_email_resources.first.resource).to eq(expired_action)
      end

      it 'does not send notifications for completed actions' do
        expect do
          described_class.perform_now
        end.not_to change(CommunicationEmailResource.where(resource: completed_action), :count)
      end

      it 'does not send notifications for active actions' do
        expect do
          described_class.perform_now
        end.not_to change(CommunicationEmailResource.where(resource: active_action), :count)
      end

      it 'does not send duplicate notifications' do
        # Create a previous notification
        development_action_communication.create_communication_email_with_resources(
          { user: user, campaign_user: campaign_user },
          expired_action
        )

        expect do
          described_class.perform_now
        end.not_to change(CommunicationEmail, :count)
      end

      context 'when an active CommunicationDelivery exists' do
        let(:project) { campaign.project }
        let(:client) { project.client }
        let!(:delivery) do
          create(:communication_delivery, :development_action_deadline_missed,
                 client: client, project: project, campaign: campaign)
        end

        before { client.client_feature.update!(use_new_communication_center: true) }

        it 'sends a notification sourced from the delivery only -- the flag suppresses the legacy send' do
          expect do
            described_class.perform_now
          end.to change(CommunicationEmail, :count).by(1)

          expect(CommunicationEmail.where(communication_delivery: delivery).count).to eq(1)
          expect(development_action_communication.reload.emails).to be_empty
        end

        it 'does not send a duplicate delivery-sourced notification on a repeat run' do
          described_class.perform_now

          expect do
            described_class.perform_now
          end.not_to change(CommunicationEmail, :count)
        end
      end
    end

    context 'when no communications are configured' do
      it 'does not send any notifications' do
        expect do
          described_class.perform_now
        end.not_to change(CommunicationEmail, :count)
      end
    end
  end
end
