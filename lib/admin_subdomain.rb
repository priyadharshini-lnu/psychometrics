# frozen_string_literal: true

module AdminSubdomain
  ADMIN_SUFFIX = '-admin'

  module_function

  def client_admin_sso_enabled?
    Settings.features.client_admin_sso_enabled
  end

  def client_prefix(raw_subdomain)
    subdomain = normalize(raw_subdomain)
    return nil if root_domain?(subdomain)

    strip_app_subdomain(subdomain)
  end

  def client_admin?(raw_subdomain)
    prefix = client_prefix(raw_subdomain)
    prefix.present? && prefix.end_with?(ADMIN_SUFFIX)
  end

  def admin?(raw_subdomain)
    root_domain?(raw_subdomain) || client_admin?(raw_subdomain)
  end

  def root_domain?(raw_subdomain)
    subdomain = normalize(raw_subdomain)
    subdomain.blank? || subdomain == Settings.subdomain.to_s.downcase
  end

  def end_user?(raw_subdomain)
    prefix = client_prefix(raw_subdomain)
    prefix.present? && !prefix.end_with?(ADMIN_SUFFIX)
  end

  def client_subdomain_from_admin(raw_subdomain)
    prefix = client_prefix(raw_subdomain)
    return nil unless prefix&.end_with?(ADMIN_SUFFIX)

    prefix.delete_suffix(ADMIN_SUFFIX)
  end

  def admin_host_for(client)
    "#{client.subdomain}#{ADMIN_SUFFIX}.#{Settings.domain}"
  end

  def admin_url_for(client, path: '/admin', params: {})
    host = admin_host_for(client)
    port = Settings.port.present? ? ":#{Settings.port}" : ''
    uri = URI.parse("#{Settings.protocol}://#{host}#{port}#{path}")
    uri.query = params.to_query if params.present?
    uri.to_s
  end

  def normalize(subdomain)
    subdomain.to_s.downcase.strip
  end

  def extract_subdomain(host)
    return '' if host.blank?

    ActionDispatch::Http::URL.extract_subdomain(host, 1).to_s
  end

  def strip_app_subdomain(subdomain)
    return subdomain if Settings.subdomain.blank?

    subdomain.gsub(/\.?#{Regexp.escape(Settings.subdomain.to_s.downcase)}$/, '').presence
  end
end
