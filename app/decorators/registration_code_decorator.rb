# frozen_string_literal: true

class RegistrationCodeDecorator < BaseDecorator
  def get_usage_stats
    "#{object.use_count} of #{object.total_count}"
  end

  def url
    h.new_user_registration_url(domain: Settings.domain,
      subdomain: object.project.subdomain, code: object.code)
  end

  def i18n
    'clients.registration_codes'
  end
end
