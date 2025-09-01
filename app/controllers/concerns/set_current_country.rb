# frozen_string_literal: true

module SetCurrentCountry
  extend ActiveSupport::Concern

  included do
    before_action :set_current_country
  end

  private

  def set_current_country
    return if Settings.features.disable_geo_restriction

    Current.user_country = Geo::IpCountryLookup.call!(resolved_ip)
  end

  def resolved_ip
    return ENV.fetch('TEST_IP', nil) if Rails.env.development? && ENV['TEST_IP'].present?
    return nil if local_ip?

    request.remote_ip
  end

  def local_ip?
    ['127.0.0.1', '::1'].include?(request.remote_ip)
  end
end
