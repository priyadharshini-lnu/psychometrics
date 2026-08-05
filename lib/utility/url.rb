# frozen_string_literal: true

module Utility
  class Url
    HOST_REGEX = /.+\.[a-z]{2,7}\z/ix
    VALID_SCHEMES = %w[http https].freeze

    def self.remove_query_params(url, params_to_remove)
      params_to_remove = ::Array.wrap(params_to_remove)
      uri = Addressable::URI.parse(url)
      params = uri.query_values
      uri.query_values = params.except(*params_to_remove).presence if params
      uri.to_s
    end

    def self.with_query_params(url, params = {})
      uri = Addressable::URI.parse(url)
      uri.query_values = (uri.query_values || {}).merge(params.stringify_keys)
      uri.to_s
    end

    def self.valid?(url)
      uri = URI.parse(url)
      return false unless VALID_SCHEMES.include?(uri.scheme)

      return false unless HOST_REGEX.match?(uri.host)

      true
    rescue URI::InvalidURIError
      false
    end

    def self.get_params(options = {})
      {
        protocol: Settings.protocol,
        domain: Settings.domain,
        host: Settings.domain,
        port: Settings.port,
        subdomain: Settings.subdomain
      }.merge(options)
    end

    def self.generate(method, options = {})
      options[:subdomain] ||= Settings.subdomain
      Rails.application.routes.url_helpers.public_send(
        method,
        get_params(options)
      )
    end

    def self.get_short_url(url: nil, owner: nil, unique_key: nil)
      unique_key ||= Shortener::ShortenedUrl.generate(url, owner: owner).unique_key

      if Settings.short_url_host
        Rails.application.routes.url_helpers.shortened_url(id: unique_key, host: Settings.short_url_host)
      else
        generate(:shortened_url, id: unique_key)
      end
    end

    def self.add_query_params(url, params = {})
      query_params = params.slice('campaign_id', 'assessment_id')

      return url if query_params.empty?

      uri = URI.parse(url)
      existing_query_params = Rack::Utils.parse_query(uri.query || '')
      new_query_params = existing_query_params.merge(query_params)

      uri.query = URI.encode_www_form(new_query_params)
      uri.to_s
    end

    def self.redirect_to_safe_internal_url(controller, url, options = {})
      if safe_internal_url?(url)
        controller.redirect_to(url, options)
      else
        controller.head(:forbidden)
      end
    end

    def self.safe_internal_url?(url)
      return false if url.blank?

      uri = parse_uri(url)
      return false unless uri
      return true if relative_url?(uri)

      # Only allow main domain or subdomains
      domain_regex = /\A([a-z0-9-]+\.)*#{Regexp.escape(Settings.domain)}\z/i
      uri.host.present? && uri.host.match?(domain_regex)
    end

    def self.parse_uri(url)
      URI.parse(url)
    rescue URI::InvalidURIError
      nil
    end

    def self.relative_url?(uri)
      uri.host.nil?
    end
  end
end
