# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ScoreApprovals::NotifyApprovers, type: :command do
  let(:campaign) { create(:campaign) }
  let(:assessment) { create(:assessment) }
  let(:approver1) { create(:client_admin, client: campaign.project.client) }
  let(:approver2) { create(:client_admin, client: campaign.project.client) }

  let!(:setting) do
    create(:ai_scoring_approval_setting,
           campaign: campaign, assessment: assessment,
           approver_ids: [approver1.id, approver2.id])
  end

  let(:user_assessment) { create(:user_assessment, campaign: campaign, assessment: assessment) }
  let(:score_approval) { AI::ScoreApproval.find(user_assessment.id) }

  describe '#call' do
    it 'sends email to each approver' do
      expect { described_class.call!(score_approval) }.to(
        have_enqueued_mail(ScoringApproving::ApproverNotificationMailer, :notify).exactly(2).times
      )
    end

    it 'does not send emails when setting has no approvers' do
      setting.update!(approver_ids: [])

      expect { described_class.call!(score_approval) }.not_to(
        have_enqueued_mail(ScoringApproving::ApproverNotificationMailer, :notify)
      )
    end
  end
end
