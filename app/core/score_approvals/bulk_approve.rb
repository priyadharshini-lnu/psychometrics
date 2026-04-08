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
      broadcast :ok, @approved_approvals, @meta
    end

    private

    def process_approval(score_approval)
      unless score_approval.allow_bulk_approve?
        @meta[:ignored] += 1
        return
      end

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
               'allow_bulk_approve', 'allow_bulk_approve_scores')
    end

    def initialize_meta
      {
        approved: 0,
        ignored: 0
      }
    end

    def send_digest_emails
      # TODO: implement email sending logic
    end
  end
end
