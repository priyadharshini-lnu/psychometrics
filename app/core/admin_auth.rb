# frozen_string_literal: true

module AdminAuth
  HANDOFF_CACHE_PREFIX     = 'admin_handoff'
  HANDOFF_VERIFIER_PURPOSE = 'admin_handoff_token'

  def self.saml_disabled_for_admins?
    Settings.features.disable_saml_for_admins
  end
end
