# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SendScoringDigestEmailsJob, type: :job do
  let(:campaign) { create(:campaign) }
  let(:assessment) { create(:assessment) }
  let(:score_approval_ids) { [1, 2, 3] }

  describe '#perform' do
    it 'calls ApprovalNotificationDigest for approver_approved' do
      expect(ScoreApprovals::ApprovalNotificationDigest).to receive(:call!).with(
        score_approval_ids, campaign.id, assessment.id
      )

      described_class.new.perform(score_approval_ids, campaign.id, assessment.id, 'approver_approved')
    end

    it 'calls ApproverNotificationDigest for assessor_approved' do
      expect(ScoreApprovals::ApproverNotificationDigest).to receive(:call!).with(
        score_approval_ids, campaign.id, assessment.id
      )

      described_class.new.perform(score_approval_ids, campaign.id, assessment.id, 'assessor_approved')
    end

    it 'does nothing for unknown status' do
      expect(ScoreApprovals::ApprovalNotificationDigest).not_to receive(:call!)
      expect(ScoreApprovals::ApproverNotificationDigest).not_to receive(:call!)

      described_class.new.perform(score_approval_ids, campaign.id, assessment.id, 'pending')
    end
  end
end
