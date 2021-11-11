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
        remove_reports if user_assessment.completed?
        reset_user_result
        remove_media_responses
        Saville::ResetAssessment.call!(user_assessment) if user_assessment.saville_user_assessment
      end

      broadcast :ok
    end

    private

    def reset_user_result
      user_assessment.update!(
        status: UserAssessment.statuses[:not_started],
        completed_at: nil,
        completion_reason: nil,
        norm_id: user_assessment.fixed_norm? ? user_assessment.norm_id : nil
      )
      users_result.update!(
        answers: {},
        scoring: nil,
        occupations: nil,
        embedded_data: nil,
        step: 0,
        expiry_date: nil,
        last_activity_at: nil,
        meta_data: {},
        additional_time: nil,
        current_element: nil,
        current_page: nil,
        reset_count: users_result.reset_count + 1,
        prev_pages: [],
        progress: 0,
        started_at: nil
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
      ).update(remove_pdf: true, status: :not_prepared)
    end
  end
end
