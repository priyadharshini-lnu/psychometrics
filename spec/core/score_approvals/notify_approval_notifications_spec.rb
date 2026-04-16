# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ScoreApprovals::NotifyApprovalNotifications, type: :command do
  let(:campaign) { create(:campaign) }
  let(:assessment) { create(:assessment) }
  let(:notification_user1) { create(:client_admin, client: campaign.project.client) }
  let(:notification_user2) { create(:client_admin, client: campaign.project.client) }

  let!(:setting) do
    create(:ai_scoring_approval_setting,
           campaign: campaign, assessment: assessment,
           approval_notification_user_ids: [notification_user1.id, notification_user2.id])
  end

  let(:user_assessment) { create(:user_assessment, campaign: campaign, assessment: assessment) }
  let(:score_approval) { AI::ScoreApproval.find(user_assessment.id) }

  describe '#call' do
    it 'sends email to each approval notification user' do
      expect { described_class.call!(score_approval) }.to(
        have_enqueued_mail(ScoringApproving::ApprovalNotificationMailer, :notify).exactly(2).times
      )
    end

    it 'does not send emails when no notification users configured' do
      setting.update!(approval_notification_user_ids: [])

      expect { described_class.call!(score_approval) }.not_to(
        have_enqueued_mail(ScoringApproving::ApprovalNotificationMailer, :notify)
      )
    end

    it 'does not send emails when setting is missing' do
      setting.destroy!

      expect { described_class.call!(score_approval) }.not_to(
        have_enqueued_mail(ScoringApproving::ApprovalNotificationMailer, :notify)
      )
    end
  end
end
