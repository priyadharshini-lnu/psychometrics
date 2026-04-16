# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ScoreApprovals::DigestEmailSender do
  let(:campaign) { create(:campaign) }
  let(:assessment) { create(:assessment) }
  let!(:setting) do
    s = create(:ai_scoring_approval_setting,
               campaign: campaign,
               assessment: assessment,
               approver_ids: [approver.id],
               approval_notification_user_ids: [notification_user.id],
               send_digest_emails: true)
    s.update_columns(digest_emails_enabled_at: 2.hours.ago, last_digest_sent_at: 1.hour.ago)
    s
  end
  let(:approver) { create(:client_admin, client: campaign.project.client) }
  let(:notification_user) { create(:client_admin, client: campaign.project.client) }

  def create_score_approval(status:, updated_at: Time.current)
    ua = create(:user_assessment, campaign: campaign, assessment: assessment, approval_status: status)
    ua.update_columns(approval_status_updated_at: updated_at)
    ua
  end

  describe '.send_for' do
    it 'enqueues jobs for assessor_approved approvals' do
      create_score_approval(status: :assessor_approved, updated_at: 30.minutes.ago)

      expect { described_class.send_for(setting) }.to(
        have_enqueued_job(SendScoringDigestEmailsJob).with(
          anything, campaign.id, assessment.id, 'assessor_approved'
        )
      )
    end

    it 'enqueues jobs for approver_approved approvals' do
      create_score_approval(status: :approver_approved, updated_at: 30.minutes.ago)

      expect { described_class.send_for(setting) }.to(
        have_enqueued_job(SendScoringDigestEmailsJob).with(
          anything, campaign.id, assessment.id, 'approver_approved'
        )
      )
    end

    it 'enqueues separate jobs when both statuses exist' do
      create_score_approval(status: :assessor_approved, updated_at: 30.minutes.ago)
      create_score_approval(status: :approver_approved, updated_at: 30.minutes.ago)

      expect { described_class.send_for(setting) }.to(
        have_enqueued_job(SendScoringDigestEmailsJob).exactly(2).times
      )
    end

    it 'skips approvals updated before last_digest_sent_at' do
      create_score_approval(status: :assessor_approved, updated_at: 2.hours.ago)

      expect { described_class.send_for(setting) }.not_to(
        have_enqueued_job(SendScoringDigestEmailsJob)
      )
    end

    it 'skips approvals updated before digest_emails_enabled_at when last_digest_sent_at is older' do
      setting.update_columns(last_digest_sent_at: 3.hours.ago)

      create_score_approval(status: :assessor_approved, updated_at: 2.5.hours.ago)

      expect { described_class.send_for(setting) }.not_to(
        have_enqueued_job(SendScoringDigestEmailsJob)
      )
    end

    it 'uses digest_emails_enabled_at when last_digest_sent_at is nil' do
      setting.update_columns(last_digest_sent_at: nil)

      create_score_approval(status: :assessor_approved, updated_at: 1.hour.ago)

      expect { described_class.send_for(setting) }.to(
        have_enqueued_job(SendScoringDigestEmailsJob)
      )
    end

    it 'does nothing when do_not_send_notifications is true' do
      setting.update_columns(do_not_send_notifications: true)
      create_score_approval(status: :assessor_approved, updated_at: 30.minutes.ago)

      expect { described_class.send_for(setting) }.not_to(
        have_enqueued_job(SendScoringDigestEmailsJob)
      )
    end

    it 'does nothing when digest_emails_enabled_at is nil' do
      setting.update_columns(digest_emails_enabled_at: nil)
      create_score_approval(status: :assessor_approved, updated_at: 30.minutes.ago)

      expect { described_class.send_for(setting) }.not_to(
        have_enqueued_job(SendScoringDigestEmailsJob)
      )
    end

    it 'does nothing when no approvals exist in the time range' do
      expect { described_class.send_for(setting) }.not_to(
        have_enqueued_job(SendScoringDigestEmailsJob)
      )
    end

    it 'ignores pending approvals' do
      create_score_approval(status: :pending, updated_at: 30.minutes.ago)

      expect { described_class.send_for(setting) }.not_to(
        have_enqueued_job(SendScoringDigestEmailsJob)
      )
    end
  end
end
