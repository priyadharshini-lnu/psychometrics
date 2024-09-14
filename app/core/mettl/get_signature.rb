# frozen_string_literal: true

module Mettl
  class GetSignature < BaseCommand
    def initialize(config, string_to_sign)
      @config = config
      @string_to_sign = string_to_sign
    end

    def call
      signature = generate_signature

      broadcast :ok, signature
    rescue StandardError => e
      broadcast :error, e.message
    end

    private

    def generate_signature
      digest = OpenSSL::Digest.new('sha256')
      CGI.escape(Base64.strict_encode64(OpenSSL::HMAC.digest(digest, private_key, string_to_sign)))
    end

    def public_key
      config['public_key']
    end

    def private_key
      config['private_key']
    end

    attr_reader :config, :string_to_sign
  end
end
