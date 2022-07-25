# frozen_string_literal: true

module Api
  module V1
    class ProjectSerializer < ActiveModel::Serializer
      attributes :id, :name, :subdomain, :client_reference, :locales, :enable_strong_password, :enable_2factor_auth,
                 :background_color, :login_box_position, :created_at, :updated_at, :project_logo_url, :partner_logo_url,
                 :background_image_url, :data_processing_consent, :client_id, :webhook

      def background_color
        object.design_migrated? ? design_setting.background_color : object.design['background_color']
      end

      def login_box_position
        object.design_migrated? ? design_setting.login_box_position : object.design['login_box_position']
      end

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
        object.two_factor_enabled
      end

      def data_processing_consent
        object.privacy_consent
      end

      def client_id
        object.parent.id
      end

      def webhook
        object.webhook_subscription&.url
      end

      def design_setting
        object.design_migrated ? object.design_setting : object
      end
    end
  end
end
