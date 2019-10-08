# frozen_string_literal: true

class RegistrationCodeDecorator < BaseDecorator
  def get_usage_stats
    "#{object.use_count} of #{object.total_count}"
  end

  def i18n
    'clients.registration_codes'
  end
end
