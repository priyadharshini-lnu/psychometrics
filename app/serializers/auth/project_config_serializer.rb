# frozen_string_literal: true

module Auth
  class ProjectConfigSerializer < ActiveModel::Serializer
    attributes :background_color, :login_box_position, :project_logo_url, :partner_logo_url,
               :background, :saml_login_allowed, :saml_enforced, :client_logo, :secondary_logo

    def project_logo_url
      object.logo&.url
    end

    def partner_logo_url
      object.secondary_logo&.url
    end

    def client_logo
      object.logo&.url
    end

    def secondary_logo
      object.secondary_logo&.url
    end

    def background
      object.background&.url || fallback_background
    end

    def saml_login_allowed
      object.saml_login_allowed?
    end

    def saml_enforced
      object.saml_enforced?
    end

    private

    def fallback_background
      instance_options[:background] unless object.background_color
    end
  end
end
