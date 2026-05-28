# frozen_string_literal: true

module Simulation
  class GetAssessmentUrl < Base
    include Rails.application.routes.url_helpers

    private_attr_reader :user_assessment

    def initialize(user_assessment)
      @user_assessment = user_assessment
    end

    def call
      token = generate_jwt_token
      redirect_url = "#{frontend_base_url}/start?token=#{token}"

      broadcast :ok, redirect_url
    end

    private

    def generate_jwt_token
      payload = {
        # name: subject.name, Do not send PII
        userId: participant_id,
        simulationId: participant_id,
        scenarioId: scenario_id,
        exp: 1.day.from_now.to_i,
        modifiers: {
          returnUrl: return_url,
          webhookUrl: assessment_progress_notification_url,
          timeExtension: time_extension,
          branding: {
            logo: project.design_setting.logo_url,
            # primary: project.design_setting.primary_color,
            theming: {
              navbarTheme: 'light'
            }
          }
        }
      }

      payload[:modifiers][:contentId] = content_variation_id if content_variation_id.present?
      payload[:modifiers][:languageRestrictions] = available_locales if available_locales.present?
      payload[:modifiers][:defaultLang] = default_locale if default_locale.present?

      if Settings.features.simulation_branding_enabled
        payload[:modifiers][:branding][:primary] = project.design_setting.primary_color
      end

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

    def simulation_user_assessment
      @simulation_user_assessment ||= user_assessment.simulation_user_assessment
    end

    def content_variation_id
      simulation_user_assessment.content_variation_id
    end

    def time_extension
      simulation_user_assessment.time_extension
    end

    def available_locales
      user_assessment.campaign_assessment&.available_locales
    end

    def default_locale
      selected_locale = user_assessment.selected_locale

      return selected_locale if available_locales.blank?

      available_locales.include?(selected_locale) ? selected_locale : ''
    end

    def project
      @project ||= user_assessment.project
    end

    def subject
      @subject ||= user_assessment.subject
    end

    def participant_id
      @participant_id ||= simulation_user_assessment.participant_id
    end

    def assessment_progress_notification_url
      Utility::Url.generate(
        :webhooks_simulation_progress_notification_url,
        project_id: project.id,
        subdomain: project.subdomain,
        jwt_token: jwt_token_for_webhook
      )
    end

    def return_url
      Utility::Url.generate(
        :redirect_simulation_user_assessment_url,
        id: user_assessment.id,
        project_id: project.id,
        subdomain: project.subdomain,
        jwt: jwt_token
      )
    end

    def jwt_token
      JWT.encode({ 'sub' => subject.id, 'exp' => session_inactivity_timeout.from_now.to_i },
                 Settings.secrets.encrypted_key.to_s, 'HS256')
    end

    def session_inactivity_timeout
      subject.session_inactivity_timeout
    end

    def jwt_token_for_webhook
      JWT.encode({ data: user_assessment.id, exp: 30.days.from_now.to_i }, Settings.secrets.webhook_jwt_secret)
    end
  end
end
