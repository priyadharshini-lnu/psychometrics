# frozen_string_literal: true

module Auth
  class ProjectConfigSerializer < ActiveModel::Serializer
    attributes :id, :background_color, :login_box_position, :background, :saml_login_allowed,
               :saml_enforced, :client_logo, :secondary_logo, :primary_color,
               :error_color, :warning_color, :success_color, :info_color, :background_size, :require_mobile_number

    DELEGATE_METHODS = %i[primary_color error_color warning_color success_color info_color].freeze

    DELEGATE_METHODS.each do |name|
      define_method name do
        design_setting.send(name) if design_setting.respond_to?(name)
      end
    end

    delegate :background_color, :login_box_position, :background_size, to: :design_setting

    def client_logo
      design_setting.logo&.url
    end

    def secondary_logo
      design_setting.secondary_logo&.url
    end

    def background
      design_setting.background&.url || fallback_background
    end

    def saml_login_allowed
      object.saml_login_allowed?
    end

    def saml_enforced
      object.saml_enforced?
    end

    def require_mobile_number
      object.registration_setting.require_mobile_number
    end

    private

    def design_setting
      object.design_setting
    end

    def fallback_background
      instance_options[:background] unless background_color
    end
  end
end
