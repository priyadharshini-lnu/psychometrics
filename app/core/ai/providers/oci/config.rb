# frozen_string_literal: true

module AI
  module Providers
    class Oci
      module Config
        class ServiceNotConfiguredError < StandardError; end
        class InvalidConfigError < StandardError; end

        def build_oci_config
          config = OCI::Config.new

          config.user = oci_credentials.user
          config.fingerprint = oci_credentials.fingerprint
          config.tenancy = oci_credentials.tenancy
          config.key_content = oci_credentials.private_key
          config.region = oci_region

          config.validate
          config
        rescue OCI::InvalidConfigError => e
          raise InvalidConfigError, "OCI Configuration Error: #{e.message}"
        end

        def oci_region
          @oci_region ||= oci_credentials.genai_region
        end

        def oci_compartment_id
          @oci_compartment_id ||= oci_credentials.compartment_id
        end

        private

        def oci_credentials
          @oci_credentials ||= Settings.secrets.oci
        end
      end
    end
  end
end
