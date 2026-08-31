# frozen_string_literal: true

require 'rails_helper'

describe Communications::CompletionTypeJob, type: :job do
  let(:campaign) { create(:campaign) }
  let(:campaign_user) { create(:campaign_user, campaign: campaign) }
  let(:user) { campaign_user.user }

  it 'creates communication_email for when user_assessment is completed' do
    user = campaign_user.user
    user_assessment = create(:user_assessment, subject: user, evaluator: user, campaign: campaign)
    communication = create(:communication, kind: :completion, project_campaign: campaign,
      project_id: campaign.project_id, assessment_id: user_assessment.assessment.id)
    expect do
      described_class.perform_now(user_assessment)
    end.to change(CommunicationEmail, :count).by(1)

    expect(communication.reload.emails.first.campaign_user_id).to eq(campaign_user.id)
  end

  it 'create communication when assessment_completion_status_code matches' do
    user = campaign_user.user
    user_assessment = create(
      :user_assessment, subject: user, evaluator: user, campaign: campaign, completion_status_code: 'code_1'
    )
    communication = create(
      :communication, kind: :completion, project_campaign: campaign,
      project_id: campaign.project_id, assessment_id: user_assessment.assessment.id,
      assessment_completion_status_code: 'code_1'
    )
    expect do
      described_class.perform_now(user_assessment)
    end.to change(CommunicationEmail, :count).by(1)

    expect(communication.reload.emails.first.campaign_user_id).to eq(campaign_user.id)
  end

  it 'does not create communication when assessment_completion_status_code does not match' do
    user = campaign_user.user
    user_assessment = create(
      :user_assessment, subject: user, evaluator: user, campaign: campaign, completion_status_code: 'code_1'
    )
    create(
      :communication, kind: :completion, project_campaign: campaign,
      project_id: campaign.project_id, assessment_id: user_assessment.assessment.id,
      assessment_completion_status_code: 'code_2'
    )
    expect do
      described_class.perform_now(user_assessment)
    end.to_not change(CommunicationEmail, :count)
  end

  it 'schedules communication for future delivery if there is delivery delay' do
    user = campaign_user.user
    user_assessment = create(
      :user_assessment, subject: user, evaluator: user, campaign: campaign, completion_status_code: 'code_1'
    )
    create(
      :communication, kind: :completion, project_campaign: campaign,
      project_id: campaign.project_id, assessment_id: user_assessment.assessment.id,
      assessment_completion_status_code: 'code_1', delivery_delay_hours: 1
    )
    expect(Communications::ScheduleDelayedCommunication).to receive(:set).with(wait: 1.hour).and_call_original
    expect do
      described_class.perform_now(user_assessment)
    end.to_not change(CommunicationEmail, :count)
  end

  it 'does not create communication_email for inactive user' do
    user_assessment = create(
      :user_assessment, subject: user, evaluator: user, campaign: campaign, completion_status_code: 'code_1'
    )
    communication = create(:communication, kind: :completion, project_campaign: campaign,
      project_id: campaign.project_id, assessment_id: user_assessment.assessment.id)

    campaign_user.update!(active: false)

    expect do
      described_class.perform_now(user_assessment)
    end.to_not change(CommunicationEmail, :count)
    expect(communication.reload.emails).to be_empty
  end

  describe 'delivery-sourced completion (Template/Delivery system)' do
    # A send_now/invitation delivery (built in the "ignores other kinds" example below) enqueues a real
    # DispatchJob via CommunicationDelivery#after_create_commit; the test env's ActiveJob adapter is :async, so
    # an unstubbed enqueue would race a real background dispatch against this describe block's assertions.
    before do
      allow(Communications::Deliveries::DispatchJob).to receive(:perform_later)
      # send_delivery_completion_emails only runs at all when the client has use_new_communication_center
      # enabled -- see CompletionTypeJob#send_delivery_completion_emails. The flag-disabled case gets its
      # own dedicated context below.
      campaign.project.client.client_feature.update!(use_new_communication_center: true)
    end

    it 'creates a communication_email for an active completion delivery with no filters' do
      user_assessment = create(:user_assessment, subject: user, evaluator: user, campaign: campaign)
      delivery = create(:communication_delivery, :completion, campaign: campaign)

      expect do
        described_class.perform_now(user_assessment)
      end.to change(CommunicationEmail, :count).by(1)

      email = delivery.reload.emails.first
      expect(email.campaign_user_id).to eq(campaign_user.id)
      expect(email.occurrence_key).to eq("completion-#{user_assessment.id}")
    end

    it 'sends the delivery-sourced email only when a legacy Communication is also configured -- the flag ' \
       'suppresses the legacy send' do
      user_assessment = create(
        :user_assessment, subject: user, evaluator: user, campaign: campaign, completion_status_code: 'code_1'
      )
      communication = create(:communication, kind: :completion, project_campaign: campaign,
        project_id: campaign.project_id, assessment_id: user_assessment.assessment.id,
        client: campaign.project.client)
      create(:communication_delivery, :completion, campaign: campaign)

      expect do
        described_class.perform_now(user_assessment)
      end.to change(CommunicationEmail, :count).by(1)

      expect(communication.reload.emails).to be_empty
    end

    it 'skips the delivery when assessment_completion_status_code does not match' do
      user_assessment = create(
        :user_assessment, subject: user, evaluator: user, campaign: campaign, completion_status_code: 'code_1'
      )
      create(:communication_delivery, :completion, campaign: campaign, assessment_completion_status_code: 'code_2')

      expect do
        described_class.perform_now(user_assessment)
      end.to_not change(CommunicationEmail, :count)
    end

    it 'skips the delivery when a selected assessment does not match the completed assessment' do
      user_assessment = create(:user_assessment, subject: user, evaluator: user, campaign: campaign)
      other_assessment = create(:assessment)
      create(:campaign_assessment, campaign: campaign, assessment: other_assessment)
      delivery = create(:communication_delivery, :completion, campaign: campaign)
      create(:communication_delivery_assessment, communication_delivery: delivery, assessment: other_assessment)

      expect do
        described_class.perform_now(user_assessment)
      end.to_not change(CommunicationEmail, :count)
    end

    it 'sends when the completed assessment is among the selected assessments' do
      user_assessment = create(:user_assessment, subject: user, evaluator: user, campaign: campaign)
      create(:campaign_assessment, campaign: campaign, assessment: user_assessment.assessment)
      delivery = create(:communication_delivery, :completion, campaign: campaign)
      create(:communication_delivery_assessment, communication_delivery: delivery,
                                                    assessment: user_assessment.assessment)

      expect do
        described_class.perform_now(user_assessment)
      end.to change(CommunicationEmail, :count).by(1)
    end

    it 'skips the delivery when recipients is selected and the user is not in the allowlist' do
      user_assessment = create(:user_assessment, subject: user, evaluator: user, campaign: campaign)
      other_campaign_user = create(:campaign_user, campaign: campaign)
      delivery = create(:communication_delivery, :completion, campaign: campaign, recipients: :selected)
      create(:communication_delivery_user, communication_delivery: delivery, user: other_campaign_user.user)

      expect do
        described_class.perform_now(user_assessment)
      end.to_not change(CommunicationEmail, :count)
    end

    it 'sends when recipients is selected and the user is in the allowlist' do
      user_assessment = create(:user_assessment, subject: user, evaluator: user, campaign: campaign)
      delivery = create(:communication_delivery, :completion, campaign: campaign, recipients: :selected)
      create(:communication_delivery_user, communication_delivery: delivery, user: user)

      expect do
        described_class.perform_now(user_assessment)
      end.to change(CommunicationEmail, :count).by(1)
    end

    it 'schedules the delivery email for future delivery when delivery_delay_hours is present' do
      user_assessment = create(:user_assessment, subject: user, evaluator: user, campaign: campaign)
      create(:communication_delivery, :completion, campaign: campaign, delivery_delay_hours: 1)

      expect(Communications::ScheduleDelayedCommunication).to receive(:set).with(wait: 1.hour).and_call_original
      expect do
        described_class.perform_now(user_assessment)
      end.to_not change(CommunicationEmail, :count)
    end

    it 'ignores deliveries for other template kinds' do
      user_assessment = create(:user_assessment, subject: user, evaluator: user, campaign: campaign)
      create(:communication_delivery, campaign: campaign, delivery_rule: :send_now)

      expect do
        described_class.perform_now(user_assessment)
      end.to_not change(CommunicationEmail, :count)
    end

    context 'when use_new_communication_center is disabled for the client' do
      before { campaign.project.client.client_feature.update!(use_new_communication_center: false) }

      it 'does not create a communication_email, even though an active delivery exists' do
        user_assessment = create(:user_assessment, subject: user, evaluator: user, campaign: campaign)
        create(:communication_delivery, :completion, campaign: campaign)

        expect do
          described_class.perform_now(user_assessment)
        end.not_to change(CommunicationEmail, :count)
      end
    end
  end
end
