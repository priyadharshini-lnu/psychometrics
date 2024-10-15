# frozen_string_literal: true

module Simulation
  class GetAssessmentUrl < Base
    include Rails.application.routes.url_helpers

    private_attr_reader :simulation_user_assessment

    def initialize(simulation_user_assessment)
      @simulation_user_assessment = simulation_user_assessment
    end

    def call
      token = generate_jwt_token
      redirect_url = "#{frontend_base_url}/start?token=#{token}"

      broadcast :ok, redirect_url
    end

    private

    def generate_jwt_token
      payload = {
        userId: participant_id,
        simulationId: participant_id,
        scenarioId: scenario_id,
        exp: 1.day.from_now.to_i,
        modifiers: {
          webhookUrl: assessment_progress_notification_url,
          branding: {
            logo: project.design_setting.logo_url,
            primary: project.design_setting.primary_color,
            success: project.design_setting.success_color,
            info: project.design_setting.info_color,
            warning: project.design_setting.warning_color,
            danger: project.design_setting.error_color
          }
        }
      }

      JWT.encode(payload, shared_secret, 'HS256')
    end

    def scenario_id
      @scenario_id ||= user_assessment.external_settings[:assessment_id]
    end

    def frontend_base_url
      config[:frontend_base_url]
    end

    def shared_secret
      credentials[:shared_secret]
    end

    def user_assessment
      @user_assessment ||= @simulation_user_assessment.user_assessment
    end

    def project
      @project ||= user_assessment.project
    end

    def participant_id
      @participant_id ||= @simulation_user_assessment.participant_id
    end

    def jwt_token
      JWT.encode({ data: user_assessment.id, exp: 30.days.from_now.to_i }, Settings.secrets.webhook_jwt_secret)
    end

    def assessment_progress_notification_url
      Utility::Url.generate(
        :webhooks_simulation_progress_notification_url,
        project_id: project.id,
        subdomain: project.subdomain,
        jwt_token: jwt_token
      )
    end
  end
end
