# frozen_string_literal: true

module UserAssessments
  class Pass < BaseCommand
    private_attr_reader :user_assessment, :lang

    def initialize(user_assessment, lang)
      @user_assessment = user_assessment
      @lang = lang
    end

    def call
      return broadcast :ok if user_assessment.users_result.completed?

      user_assessment.users_result.update(build_params)

      broadcast :ok
    end

    private

    def build_params
      params = {
        status: :in_progress
      }
      params[:selected_locale] = lang if lang
      params[:expiry_date] = time.second.from_now if time
      params[:started_at] = Time.now unless user_assessment.users_result.started_at

      params
    end

    def time
      return user_assessment.users_result.additional_time if user_assessment.users_result.interrupted?
      return user_assessment.assessment.extra['timer'] if user_assessment.users_result.not_started?

      nil
    end
  end
end
