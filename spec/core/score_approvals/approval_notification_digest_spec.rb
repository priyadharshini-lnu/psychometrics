# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ScoreApprovals::ApprovalNotificationDigest, type: :command do
  let(:campaign) { create(:campaign) }
  let(:assessment) { create(:assessment) }
  let(:notification_user1) { create(:client_admin, client: campaign.project.client) }
  let(:notification_user2) { create(:client_admin, client: campaign.project.client) }

  let!(:setting) do
    create(:ai_scoring_approval_setting,
           campaign: campaign, assessment: assessment,
           approval_notification_user_ids: [notification_user1.id, notification_user2.id],
           send_digest_emails: true,
           digest_emails_enabled_at: 1.day.ago)
  end

  let!(:sa1) do
    ua = create(:user_assessment, campaign: campaign, assessment: assessment, approval_status: :approver_approved)
    ua.id
  end

  describe '#call' do
    it 'sends digest email to each notification user' do
      expect { described_class.call!([sa1], campaign.id, assessment.id) }.to(
        have_enqueued_mail(ScoringApproving::ApprovalNotificationDigestMailer, :notify).exactly(2).times
      )
    end

    it 'updates last_digest_sent_at' do
      described_class.call!([sa1], campaign.id, assessment.id)
      expect(setting.reload.last_digest_sent_at).to be_within(2.seconds).of(Time.current)
    end

    it 'does nothing when approval_notification_user_ids is empty' do
      setting.update!(approval_notification_user_ids: [])

      expect { described_class.call!([sa1], campaign.id, assessment.id) }.not_to(
        have_enqueued_mail(ScoringApproving::ApprovalNotificationDigestMailer, :notify)
      )
    end
  end
end
