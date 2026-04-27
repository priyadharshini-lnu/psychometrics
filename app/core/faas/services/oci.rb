# frozen_string_literal: true

module Faas
  class Services::Oci
    module Exceptions
      class TooManyRequest < StandardError; end
      class IncorrectState < StandardError; end
      class ServiceUnavailable < StandardError; end
    end

    private_attr_reader :invoke_endpoint, :options, :function_identifier

    def initialize(invoke_endpoint, options = {})
      @invoke_endpoint = invoke_endpoint
      @options = options
      @function_identifier = options[:function_name].to_s
    end

    def call(payload = nil)
      OciFunctionInvokerJob.perform_later(function_identifier, invoke_endpoint, payload, options)
    end

    def invoke!(payload = nil)
      function_invoke_client = OCI::Functions::FunctionsInvokeClient.new(
        config: oci_config,
        endpoint: function_endpoint
      )
      # For available options
      # Ref: https://docs.oracle.com/en-us/iaas/tools/ruby/2.21.0/OCI/Functions/FunctionsInvokeClient.html#invoke_function-instance_method
      invoke_options = {
        invoke_function_body: payload,
        fn_invoke_type: 'detached'
      }

      begin
        function_invoke_client.invoke_function(function_id, invoke_options)
      rescue OCI::Errors::ServiceError => e
        Rails.logger.error("OCI Function Error: #{e}")
        handle_service_error(e)
      end
    end

    private

    def oci_config
      config = ::OCI::Config.new

      config.user = Settings.secrets.oci.user
      config.fingerprint = Settings.secrets.oci.fingerprint
      config.tenancy = Settings.secrets.oci.tenancy
      config.key_content = Settings.secrets.oci.private_key
      config.region = oci_region

      config.validate

      config
    rescue OCI::InvalidConfigError => e
      raise "OCI Configuration Error: #{e.message}"
    end

    def function_id
      uri = URI.parse(invoke_endpoint)
      uri.path.split('/').find { |part| part.start_with?('ocid1.') }
    end

    def oci_region
      uri = URI.parse(invoke_endpoint)
      host = uri.host
      host.split('.')[1]
    end

    def function_endpoint
      uri = URI.parse(invoke_endpoint)
      "#{uri.scheme}://#{uri.host}"
    end

    def handle_service_error(error)
      case error.status_code
        when 429
          raise Exceptions::TooManyRequest, "Too many requests: #{error.message}"
        when 409
          raise Exceptions::IncorrectState, "Incorrect state: #{error.message}"
        when 503
          raise Exceptions::ServiceUnavailable, "Service unavailable: #{error.message}"
        else
          raise
      end
    end
  end
end
