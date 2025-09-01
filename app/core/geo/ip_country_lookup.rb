# frozen_string_literal: true

module Geo
  class IpCountryLookup < BaseCommand
    class CountryNotFoundError < StandardError; end

    attr_reader :ip_address, :db

    def initialize(ip_address)
      @ip_address = ip_address
      @db = Rails.application.config.ip_database
    end

    def call
      return unless db && ip_address

      result = db.lookup(ip_address)
      unless result.found?
        raise CountryNotFoundError, "Country not found for IP: #{ip_address}"
      end

      broadcast(:ok, result.country.name)
    rescue StandardError => e
      log_error(e)
      nil
    end

    private

    def log_error(error)
      Rails.logger.debug { "[Geo::IpCountryLookup] #{error.class}: #{error.message}" }
      # TODO: Maybe log to sentry for manual investigation?
      # Sentry.capture_exception(error)
    end
  end
end
