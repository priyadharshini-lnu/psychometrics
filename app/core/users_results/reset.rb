# frozen_string_literal: true

module UsersResults
  class Reset < BaseCommand
    private_attr_reader :user_assessment

    def initialize(user_assessment)
      @user_assessment = user_assessment
    end

    def call
      transaction do
        remove_reports if users_result.completed?
        reset_user_result
        remove_media_responses
        update_users_result_id_on_assessment
      end

      broadcast :ok
    end

    private

    def users_result
      @users_result ||=
        if current_user_result&.user_assessments&.length == 1
          current_user_result
        else
          current_user_result.dup
        end
    end

    def current_user_result
      @current_user_result ||= user_assessment.users_result
    end

    def reset_user_result
      users_result.assign_attributes(
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
        current_page: nil
      )
      users_result.save
    end

    def remove_media_responses
      MediaResponse.where(users_result_id: users_result.id).destroy_all unless new_users_result?
    end

    def update_users_result_id_on_assessment
      if new_users_result?
        user_assessment.update(
          users_result_id: users_result.id
        )
      end
    end

    def new_users_result?
      user_assessment.users_result_id != users_result.id
    end

    def remove_reports
      UserReport.where(
        report_id: users_result.assessment.report_ids,
        user_id: users_result.subject_id,
        campaign_id: users_result.campaign_id
      ).update(remove_pdf: true, status: :generating)
    end
  end
end
