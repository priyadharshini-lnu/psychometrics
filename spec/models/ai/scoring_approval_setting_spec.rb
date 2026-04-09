# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AI::ScoringApprovalSetting, type: :model do
  let(:campaign) { create(:campaign) }
  let(:assessment) { create(:assessment) }
  let(:users) { create_list(:client_admin, 3, client: campaign.project.client) }

  describe '.for_user' do
    it 'returns settings where user is an assessor, approver, or approval notification user' do
      setting1 = create(:ai_scoring_approval_setting,
                        campaign: campaign, assessment: assessment,
                        assessor_ids: [users[0].id],
                        approver_ids: [users[1].id],
                        approval_notification_user_ids: [users[2].id])

      expect(described_class.for_user(users[0].id)).to match_array([setting1])
      expect(described_class.for_user(users[1].id)).to match_array([setting1])
      expect(described_class.for_user(users[2].id)).to match_array([setting1])
    end

    it 'does not return settings where user is not listed' do
      create(:ai_scoring_approval_setting,
             campaign: campaign, assessment: assessment,
             assessor_ids: [users[0].id])

      expect(described_class.for_user(users[1].id)).to be_empty
    end
  end

  describe 'before_save :set_digest_emails_enabled_at' do
    it 'sets digest_emails_enabled_at when send_digest_emails changes from false to true' do
      setting = create(:ai_scoring_approval_setting,
                       campaign: campaign, assessment: assessment,
                       send_digest_emails: false)

      setting.update!(send_digest_emails: true)
      expect(setting.reload.digest_emails_enabled_at).to be_within(2.seconds).of(Time.current)
    end

    it 'does not change digest_emails_enabled_at when send_digest_emails goes from true to false' do
      original_time = 2.days.ago
      setting = create(:ai_scoring_approval_setting,
                       campaign: campaign, assessment: assessment,
                       send_digest_emails: true)
      setting.update_columns(digest_emails_enabled_at: original_time)

      setting.update!(send_digest_emails: false)
      expect(setting.reload.digest_emails_enabled_at).to be_within(1.second).of(original_time)
    end

    it 'does not overwrite digest_emails_enabled_at on unrelated updates' do
      original_time = 2.days.ago
      setting = create(:ai_scoring_approval_setting,
                       campaign: campaign, assessment: assessment,
                       send_digest_emails: true)
      setting.update_columns(digest_emails_enabled_at: original_time)

      setting.update!(digest_frequency: 'weekly')
      expect(setting.reload.digest_emails_enabled_at).to be_within(1.second).of(original_time)
    end
  end

  describe 'after_commit :trigger_cleanup_email' do
    let!(:setting) do
      create(:ai_scoring_approval_setting,
             campaign: campaign, assessment: assessment,
             send_digest_emails: true,
             digest_emails_enabled_at: 1.day.ago,
             digest_delivery_mode: 'scheduled')
    end

    it 'sends pending digest when switching from scheduled to immediate' do
      expect(ScoreApprovals::DigestEmailSender).to receive(:send_for).with(setting)

      setting.update!(digest_delivery_mode: 'immediate')
    end

    it 'sends pending digest when turning off send_digest_emails' do
      expect(ScoreApprovals::DigestEmailSender).to receive(:send_for).with(setting)

      setting.update!(send_digest_emails: false)
    end

    it 'does not send digest when switching from immediate to scheduled' do
      setting.update!(digest_delivery_mode: 'immediate')

      expect(ScoreApprovals::DigestEmailSender).not_to receive(:send_for)

      setting.update!(digest_delivery_mode: 'scheduled')
    end

    it 'does not send digest on unrelated setting changes' do
      expect(ScoreApprovals::DigestEmailSender).not_to receive(:send_for)

      setting.update!(digest_frequency: 'weekly')
    end
  end
end
