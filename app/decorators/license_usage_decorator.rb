# frozen_string_literal: true

class LicenseUsageDecorator < BaseDecorator
  def status_updated_by_email
    status_updated_by_id.nil? ? I18n.t('.na') : status_updated_by.email
  end
end
