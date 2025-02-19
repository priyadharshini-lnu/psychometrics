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

      user_assessment.update(build_user_assessment_params)

      broadcast :ok
    end

    private

    def build_user_assessment_params
      params = {}
      params[:selected_locale] = lang if lang
      params[:progress_reseted] = false
      params[:evaluation_session_id] = Devise.friendly_token

      return params if instructions_enabled?

      params[:started_at] = Time.zone.now unless user_assessment.started_at
      params[:expiry_date] = time.second.from_now if time
      params[:status] = :in_progress

      params
    end

    def instructions_enabled?
      return false if user_assessment.interrupted?

      @user_assessment.assessment.fixed_timed? || @user_assessment.assessment.instructions&.dig('enabled')
    end

    def time
      return user_assessment.additional_time if user_assessment.interrupted?
      return user_assessment.assessment.extra['timer'] if user_assessment.not_started?

      nil
    end
  end
end
