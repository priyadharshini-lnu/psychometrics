# frozen_string_literal: true

module UsersResults
  class Reset < BaseCommand
    private_attr_reader :user_assessment, :users_result

    def initialize(user_assessment)
      @user_assessment = user_assessment
      @users_result = user_assessment.users_result
    end

    def call
      transaction do
        Iiht::AllowAttempts.call!(user_assessment) if user_assessment.iiht?
        remove_reports if user_assessment.completed?
        reset_user_result
        remove_media_responses
        Saville::ResetAssessment.call!(user_assessment) if user_assessment.saville?
      end

      broadcast :ok
    end

    private

    def reset_user_result
      user_assessment.update!(
        status: UserAssessment.statuses[:not_started],
        completed_at: nil,
        completion_reason: nil,
        norm_id: user_assessment.fixed_norm? ? user_assessment.norm_id : nil,
        reset_count: user_assessment.reset_count + 1,
        expiry_date: nil,
        selected_locale: nil,
        additional_time: nil,
        started_at: nil,
        last_activity_at: nil,
        manager_evaluation_status: :waiting,
        evaluator_nomination_status: :waiting,
        completion_status_code: nil,
        evaluation_session_id: nil
      )
      users_result.generate_randomseed
      users_result.update!(
        answers: {},
        scoring: nil,
        occupations: nil,
        embedded_data: nil,
        step: 0,
        meta_data: {},
        current_element: nil,
        current_page: nil,
        prev_pages: [],
        progress: 0
      )
    end

    def remove_media_responses
      MediaResponse.where(users_result_id: users_result.id).destroy_all
    end

    def remove_reports
      UserReport.where(
        report_id: users_result.assessment.report_ids,
        user_id: user_assessment.subject_id,
        campaign_id: user_assessment.campaign_id
      ).update(remove_pdf: true, status: :not_prepared, approval_status: :not_ready)
    end
  end
end
