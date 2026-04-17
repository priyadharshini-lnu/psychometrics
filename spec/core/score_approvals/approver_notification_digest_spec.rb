# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ScoreApprovals::ApproverNotificationDigest, type: :command do
  let(:campaign) { create(:campaign) }
  let(:assessment) { create(:assessment) }
  let(:approver1) { create(:client_admin, client: campaign.project.client) }
  let(:approver2) { create(:client_admin, client: campaign.project.client) }

  let!(:setting) do
    create(:ai_scoring_approval_setting,
           campaign: campaign, assessment: assessment,
           approver_ids: [approver1.id, approver2.id],
           send_digest_emails: true,
           digest_emails_enabled_at: 1.day.ago)
  end

  let!(:sa1) do
    ua = create(:user_assessment, campaign: campaign, assessment: assessment, approval_status: :assessor_approved)
    ua.id
  end

  let!(:sa2) do
    ua = create(:user_assessment, campaign: campaign, assessment: assessment, approval_status: :assessor_approved)
    ua.id
  end

  describe '#call' do
    it 'sends digest email to each approver' do
      expect { described_class.call!([sa1, sa2], campaign.id, assessment.id) }.to(
        have_enqueued_mail(ScoringApproving::ApproverNotificationDigestMailer, :notify).exactly(2).times
      )
    end

    it 'updates last_digest_sent_at' do
      described_class.call!([sa1], campaign.id, assessment.id)
      expect(setting.reload.last_digest_sent_at).to be_within(2.seconds).of(Time.current)
    end

    it 'does nothing when approver_ids is empty' do
      setting.update!(approver_ids: [])

      expect { described_class.call!([sa1], campaign.id, assessment.id) }.not_to(
        have_enqueued_mail(ScoringApproving::ApproverNotificationDigestMailer, :notify)
      )
    end

    it 'does nothing when setting does not exist' do
      setting.destroy!

      expect { described_class.call!([sa1], campaign.id, assessment.id) }.not_to(
        have_enqueued_mail(ScoringApproving::ApproverNotificationDigestMailer, :notify)
      )
    end
  end
end
