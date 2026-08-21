# frozen_string_literal: true

module Api
  module V1
    class ProjectSerializer < Panko::Serializer
      attributes :id, :name, :subdomain, :client_reference, :locales, :enable_strong_password, :enable_2factor_auth,
                 :background_color, :login_box_position, :created_at, :updated_at, :project_logo_url, :partner_logo_url,
                 :background_image_url, :data_processing_consent, :client_id, :webhook, :logo_alt_text,
                 :secondary_logo_alt_text, :campaign_dashboard_instructions

      delegate :background_color, :login_box_position, :logo_alt_text, :secondary_logo_alt_text, to: :design_setting

      def client_reference
        object.number
      end

      def enable_strong_password
        object.security_setting.enforce_strong_password
      end

      def project_logo_url
        design_setting.logo&.url
      end

      def partner_logo_url
        design_setting.secondary_logo&.url
      end

      def background_image_url
        design_setting.background&.url
      end

      def enable_2factor_auth
        object.security_setting.tfa_enabled
      end

      def data_processing_consent
        object.privacy_setting.privacy_consent
      end

      def client_id
        object.parent.id
      end

      def webhook
        object.webhooks.last&.url
      end

      private

      def design_setting
        object.design_setting
      end
    end
  end
end
