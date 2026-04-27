# frozen_string_literal: true

module ScoreApprovals
  class BulkApprove < BaseCommand
    attr_reader :current_user, :user_assessment_ids

    def initialize(user_assessment_ids, current_user)
      @user_assessment_ids = user_assessment_ids
      @current_user = current_user
    end

    def call
      @meta = initialize_meta
      @approved_approvals = []
      score_approvals.each { |score_approval| process_approval(score_approval) }
      send_digest_emails

      broadcast :ok, @approved_approvals, @meta
    end

    private

    def process_approval(score_approval)
      unless score_approval.allow_bulk_approve?
        @meta[:ignored] += 1
        return
      end

      score_approval.skip_event_emails = true if digest_enabled?(score_approval)

      result = ScoreApprovals::ApproveAllQuestions.call(score_approval, current_user, bulk_scoring_approval: true)
      if result[:ok].present?
        @approved_approvals << score_approval
        @meta[:approved] += 1
      else
        @meta[:ignored] += 1
      end
    end

    def score_approvals
      ::AI::ScoringApprovalSetting.user_tasks(current_user).
        where(id: user_assessment_ids).
        select('user_assessments.*', 'assessor_ids', 'approver_ids',
               'allow_bulk_approve', 'allow_bulk_approve_scores',
               'send_digest_emails', 'do_not_send_notifications', 'digest_delivery_mode')
    end

    def initialize_meta
      {
        approved: 0,
        ignored: 0
      }
    end

    def digest_enabled?(score_approval)
      score_approval.try(:send_digest_emails) && !score_approval.try(:do_not_send_notifications)
    end

    def send_digest_emails
      grouped = @approved_approvals.group_by { |sa| [sa.campaign_id, sa.assessment_id] }
      grouped.each do |(campaign_id, assessment_id), approvals|
        setting = AI::ScoringApprovalSetting.find_by(
          campaign_id: campaign_id, assessment_id: assessment_id
        )

        next if setting&.do_not_send_notifications?
        next unless setting&.send_digest_emails
        next unless setting&.digest_delivery_mode == 'immediate'

        new_status = approvals.first.approval_status
        score_approval_ids = approvals.map(&:id)
        SendScoringDigestEmailsJob.perform_later(
          score_approval_ids, campaign_id, assessment_id, new_status
        )
      end
    end
  end
end
