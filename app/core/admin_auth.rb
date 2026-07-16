# frozen_string_literal: true

module AdminAuth
  def self.saml_disabled_for_admins?
    Settings.features.disable_saml_for_admins
  end
end
