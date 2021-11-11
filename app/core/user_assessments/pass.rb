# frozen_string_literal: true

module UserAssessments
  class Pass < BaseCommand
    private_attr_reader :user_assessment, :lang

    def initialize(user_assessment, lang = nil)
      @user_assessment = user_assessment
      @lang = lang
    end

    def call
      return broadcast :ok if user_assessment.completed?

      UserAssessments::Webhook.new(user_assessment).publish_assessment_started if user_assessment.not_started?
      user_assessment.users_result.update(build_user_result_params)
      user_assessment.in_progress! unless @user_assessment.assessment.fixed_timed?

      broadcast :ok
    end

    private

    def build_user_result_params
      params = {}
      params[:selected_locale] = lang if lang

      if !@user_assessment.assessment.fixed_timed? && !@user_assessment.assessment.instructions&.dig('enabled')
        params[:started_at] = Time.now unless user_assessment.users_result.started_at
      end
      params[:expiry_date] = time.second.from_now if time

      params
    end

    def time
      return user_assessment.users_result.additional_time if user_assessment.interrupted?
      return user_assessment.assessment.extra['timer'] if user_assessment.not_started?

      nil
    end
  end
end
