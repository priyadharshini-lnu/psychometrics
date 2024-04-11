# frozen_string_literal: true

module UserAssessments
  class ResetProgress < BaseCommand
    private_attr_reader :user_assessment, :user_result

    def initialize(user_assessment, **options)
      @user_assessment = user_assessment
      @user_result = user_assessment.users_result
      @options = options
    end

    def call
      transaction do
        remove_reports if user_assessment.completed?
        user_assessment.update!(
          status: UserAssessment.statuses[:in_progress],
          completed_at: nil,
          completion_reason: nil,
          norm_id: user_assessment.fixed_norm? ? user_assessment.norm_id : nil,
          progress_reseted: @options[:reset_flag] || false,
          manager_evaluation_status: :waiting,
          evaluator_nomination_status: :waiting
        )
        user_result.update!(
          answers: set_answers_as_dirty,
          scoring: nil,
          occupations: nil,
          embedded_data: nil,
          meta_data: {},
          current_element: nil,
          current_page: nil,
          prev_pages: [],
          step: 0,
          progress: 0
        )
      end

      broadcast :ok
    end

    private

    def remove_reports
      UserReport.where(
        report_id: user_assessment.assessment.report_ids,
        user_id: user_assessment.subject_id,
        campaign_id: user_assessment.campaign_id
      ).each(&:remove_report_pdf!)
    end

    def set_answers_as_dirty
      user_result.answers&.each { |_, r| r['dirty'] = true }
    end
  end
end
