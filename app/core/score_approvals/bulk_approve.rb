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
      score_approvals.each do |score_approval|
        if score_approval.allow_bulk_approve?
          ScoreApprovals::ApproveAllQuestions.call(score_approval, current_user)
          @approved_approvals << score_approval
          @meta[:approved] += 1
        else
          @meta[:ignored] += 1
        end
      end

      broadcast :ok, @approved_approvals, @meta
    end

    private

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
