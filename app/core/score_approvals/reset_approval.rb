# frozen_string_literal: true

module ScoreApprovals
  class ResetApproval < BaseCommand
    private_attr_reader :score_approval, :current_user

    RESETTABLE_STATUSES = %w[assessor_approved approver_approved auto_approved].freeze
    MERGED_STATUSES = %w[approver_approved auto_approved].freeze

    def initialize(score_approval, current_user)
      @score_approval = score_approval
      @current_user = current_user
    end

    def call
      return broadcast :error, I18n.t('admin.score_approval_reset_not_allowed') unless resettable?

      @merged = MERGED_STATUSES.include?(score_approval.approval_status)

      transaction do
        apply_transition
        downgrade_factor_scores
        recompute_scoring_and_reset_reports if merged?
      end

      broadcast :ok
    rescue StandardError => e
      broadcast :error, e.message
    end

    private

    def resettable?
      RESETTABLE_STATUSES.include?(score_approval.approval_status)
    end

    def merged?
      @merged
    end

    def apply_transition
      case score_approval.approval_status
        when 'approver_approved' then score_approval.remove_approval!
        when 'assessor_approved' then score_approval.abort!
        when 'auto_approved' then score_approval.reset!
      end
    end

    def downgrade_factor_scores
      users_result.ai_factor_scores.where.not(scoring_type: :aggregated).
        update_all(status: score_approval.approval_status)
    end

    def recompute_scoring_and_reset_reports
      users_result.update!(scoring: ::UsersResults::CalculateScoring.call!(users_result))
      reset_dependent_reports
    end

    def reset_dependent_reports
      user_assessment.user_reports.each do |user_report|
        next if user_report.not_ready?

        user_report.remove_all_report_pdfs!
        user_report.update!(approval_status: :not_ready) if user_report.has_approval_workflow?
      end
    end

    def user_assessment
      @user_assessment ||= score_approval.as_user_assessment
    end

    def users_result
      @users_result ||= score_approval.users_result
    end
  end
end
