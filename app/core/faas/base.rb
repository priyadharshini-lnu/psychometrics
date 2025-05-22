# frozen_string_literal: true

module Faas
  class Base < BaseCommand
    class ServiceNotConfiguredError < StandardError; end
    class UnsupportedServiceError < StandardError; end

    include Rails.application.routes.url_helpers

    private_attr_reader :options

    SERVICES = {
      aws: ::Faas::Services::Aws,
      oci: ::Faas::Services::Oci
    }.freeze

    def initialize(options)
      @options = options
    end

    private

    def make_request
      service_provider.new(
        function_details,
        options.merge(function_name: function_name)
      ).call(jwt_request_body)
    end

    def jwt_request_body
      encode_message(request_body)
    end

    def webhook_message
      return unless options[:webhook_message]

      encode_message(options[:webhook_message])
    end

    def encode_message(message)
      JWT.encode(
        { data: message, exp: expiry_time.from_now.to_i },
        signing_secret,
        'HS256'
      )
    end

    def expiry_time
      12.hours
    end

    def signing_secret
      @signing_secret ||= Settings.secrets.faas[:signing_secret]
    end

    def function_name
      raise "Define function_name in #{self.class.name}"
    end

    def function_details
      @function_details ||= if cloud_function_service_provider.nil? || cloud_function_service_provider == 'aws'
                              Settings.secrets.aws.dig(:lambda, function_name)
                            else
                              Settings.secrets.oci.dig(:functions, function_name)
                            end
    end

    def service_provider
      if cloud_function_service_provider.nil?
        raise ServiceNotConfiguredError, 'CLOUD_FUNCTION_SERVICE provider is not configured'
      end

      SERVICES[cloud_function_service_provider.to_sym] ||
        raise(UnsupportedServiceError,
              "Unsupported service: #{cloud_function_service_provider}. Supported services are: #{SERVICES.keys}")
    end

    def cloud_function_service_provider
      @cloud_function_service_provider ||= Settings.cloud_functions_service
    end
  end
end
