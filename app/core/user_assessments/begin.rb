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

      user_assessment.update(build_user_assessment_params)

      if user_assessment.status_previously_changed?(from: :not_started, to: :in_progress)
        UserAssessments::Webhook.new(user_assessment).publish_assessment_started
      end

      # user_assessment.in_progress!

      broadcast :ok
    end

    private

    def build_user_assessment_params
      params = {}
      params[:progress_reseted] = false
      params[:selected_locale] = lang if lang
      params[:expiry_date] = time.second.from_now if time
      params[:started_at] = Time.zone.now unless user_assessment.started_at
      params[:evaluation_session_id] = Devise.friendly_token
      params[:status] = :in_progress

      params
    end

    def time
      return user_assessment.additional_time if user_assessment.interrupted?
      return user_assessment.assessment.extra['timer'] if user_assessment.not_started?

      nil
    end
  end
end
