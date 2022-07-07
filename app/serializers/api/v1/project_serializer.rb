# frozen_string_literal: true

module Api
  module V1
    class ProjectSerializer < ActiveModel::Serializer
      attributes :id, :name, :subdomain, :client_reference, :locales, :enable_strong_password, :enable_2factor_auth,
                 :background_color, :login_box_position, :created_at, :updated_at, :project_logo_url, :partner_logo_url,
                 :background_image_url, :data_processing_consent, :client_id, :webhook
      def client_reference
        object.number
      end

      def enable_strong_password
        object.security_setting.enforce_strong_password
      end

      def project_logo_url
        object.logo&.url
      end

      def partner_logo_url
        object.secondary_logo&.url
      end

      def background_image_url
        object.background&.url
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
    end
  end
end
