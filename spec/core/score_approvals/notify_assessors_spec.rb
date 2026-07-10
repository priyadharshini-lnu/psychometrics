# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ScoreApprovals::NotifyAssessors, type: :command do
  let(:campaign) { create(:campaign) }
  let(:assessment) { create(:assessment) }
  let(:assessor1) { create(:client_admin, client: campaign.project.client) }
  let(:assessor2) { create(:client_admin, client: campaign.project.client) }
  let(:approver1) { create(:client_admin, client: campaign.project.client) }
  let(:approver2) { create(:client_admin, client: campaign.project.client) }

  let!(:setting) do
    create(:ai_scoring_approval_setting,
           campaign: campaign, assessment: assessment,
           assessor_ids: [assessor1.id, assessor2.id], approver_ids: [approver1.id, approver2.id])
  end

  let(:user_assessment) { create(:user_assessment, campaign: campaign, assessment: assessment) }
  let(:score_approval) { AI::ScoreApproval.find(user_assessment.id) }

  describe '#call' do
    it 'sends email to each assessor user for two-level approval' do
      expect { described_class.call!(score_approval) }.to(
        have_enqueued_mail(ScoringApproving::AssessorNotificationMailer, :notify).exactly(2).times
      )
    end

    it 'sends email to each approver user for one-level approval' do
      setting.update!(allow_one_level_approve: true)

      expect { described_class.call!(score_approval) }.to(
        have_enqueued_mail(ScoringApproving::AssessorNotificationMailer, :notify).exactly(2).times
      )
    end

    it 'does not send emails when no assessor users configured' do
      setting.update!(assessor_ids: [])

      expect { described_class.call!(score_approval) }.not_to(
        have_enqueued_mail(ScoringApproving::AssessorNotificationMailer, :notify)
      )
    end

    it 'does not send emails when no approver users configured for one-level approval' do
      setting.update!(allow_one_level_approve: true, approver_ids: [])

      expect { described_class.call!(score_approval) }.not_to(
        have_enqueued_mail(ScoringApproving::AssessorNotificationMailer, :notify)
      )
    end

    it 'does not send emails when setting is missing' do
      setting.destroy!

      expect { described_class.call!(score_approval) }.not_to(
        have_enqueued_mail(ScoringApproving::AssessorNotificationMailer, :notify)
      )
    end
  end
end
