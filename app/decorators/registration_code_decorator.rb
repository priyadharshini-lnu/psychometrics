# frozen_string_literal: true

class RegistrationCodeDecorator < BaseDecorator
  def get_usage_stats
    "#{object.use_count} of #{object.total_count}"
  end

  def url
    root_url = h.root_url(domain: Settings.domain, subdomain: object.project.subdomain)
    "#{root_url}users/sign_up?code=#{object.code}"
  end

  def i18n
    'clients.registration_codes'
  end
end
