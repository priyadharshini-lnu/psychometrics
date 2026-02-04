# frozen_string_literal: true

module Psy
  class Oci
    def self.config
      config = ::OCI::Config.new
      config.user = Settings.secrets.oci.user
      config.fingerprint = Settings.secrets.oci.fingerprint
      config.tenancy = Settings.secrets.oci.tenancy
      config.key_content = Settings.secrets.oci.private_key
      config.region = Settings.secrets.oci.default_region
      config.validate
      config
    rescue OCI::InvalidConfigError => e
      raise "OCI Configuration Error: #{e.message}"
    end

    def self.gen_ai_config
      config = self.config
      config.region = Settings.secrets.oci.genai_region
      config.validate
      config
    end
  end
end
