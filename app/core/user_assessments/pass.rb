# frozen_string_literal: true

module UserAssessments
  class Pass < BaseCommand
    private_attr_reader :user_assessment, :lang

    def initialize(user_assessment, lang)
      @user_assessment = user_assessment
      @lang = lang
    end

    def call
      return broadcast :ok if user_assessment.completed?

      publish_to_webhook
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

    def publish_to_webhook
      return unless user_assessment.users_result.not_started?

      data = {
        campaign: user_assessment.campaign,
        assessment: user_assessment.assessment,
        evaluator: user_assessment.evaluator,
        subject: user_assessment.subject
      }
      WebhookSubscriptions::Publish.call!(user_assessment.evaluator.project, :assessment_started, data)
    end

    def time
      return user_assessment.users_result.additional_time if user_assessment.interrupted?
      return user_assessment.assessment.extra['timer'] if user_assessment.not_started?

      nil
    end
  end
end
