# frozen_string_literal: true

module Saml
  class GetIdpSettings
    def initialize(subdomain, setting_type)
      @subdomain = subdomain
      @setting_type = setting_type
    end

    def settings(_)
      project = Client.find_by!(subdomain: @subdomain)
      project.saml_setting_details(@setting_type.presence&.to_sym)
    end
  end
end
