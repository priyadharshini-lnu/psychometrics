# frozen_string_literal: true

module Utility
  class Url
    def self.remove_query_params(url, params_to_remove)
      params_to_remove = ::Array.wrap(params_to_remove)
      uri = Addressable::URI.parse(url)
      params = uri.query_values
      uri.query_values = params.except(*params_to_remove).presence if params
      uri.to_s
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
  end
end
