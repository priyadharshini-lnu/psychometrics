# frozen_string_literal: true

module UserAssessments
  class Begin < BaseCommand
    private_attr_reader :user_assessment, :lang

    def initialize(user_assessment, lang = nil)
      @user_assessment = user_assessment
      @lang = lang
    end

    def call
      return broadcast :ok if user_assessment.completed?

      user_assessment.users_result.update(build_user_result_params)
      user_assessment.in_progress!

      broadcast :ok
    end

    private

    def build_user_result_params
      params = {}
      params[:selected_locale] = lang if lang
      params[:expiry_date] = time.second.from_now if time
      params[:started_at] = Time.now unless user_assessment.users_result.started_at
      params
    end

    def time
      return user_assessment.users_result.additional_time if user_assessment.interrupted?
      return user_assessment.assessment.extra['timer'] if user_assessment.not_started?

      nil
    end
  end
end
