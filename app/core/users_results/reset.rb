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
        remove_reports if users_result.completed?
        reset_user_result
        remove_media_responses
      end

      broadcast :ok
    end

    private

    def reset_user_result
      users_result.update_attributes(
        answers: {},
        scoring: nil,
        occupations: nil,
        embedded_data: nil,
        status: UsersResult.statuses[:not_started],
        completed_at: nil,
        step: 0,
        norm_id: nil,
        norm_type: nil,
        expiry_date: nil,
        last_activity_at: nil,
        meta_data: {},
        additional_time: nil,
        current_element: nil,
        current_page: nil,
        reset_count: users_result.reset_count + 1
      )
    end

    def remove_media_responses
      MediaResponse.where(users_result_id: users_result.id).destroy_all
    end

    def remove_reports
      UserReport.where(
        report_id: users_result.assessment.report_ids,
        user_id: users_result.subject_id,
        campaign_id: user_assessment.campaign_id
      ).update(remove_pdf: true, status: :not_prepared)
    end
  end
end
