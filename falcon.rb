#!/usr/bin/env falcon host
# frozen_string_literal: true

require 'falcon/environment/rack'
require 'falcon/environment/supervisor'
require 'openssl'
require_relative 'config/environment'

module SSLContextHelper
  module_function

  def get_ssl_context(ssl_key_path, ssl_cert_path, allow_ssl)
    return nil unless allow_ssl && ssl_key_path && ssl_cert_path

    ssl_context = OpenSSL::SSL::SSLContext.new
    ssl_context.min_version = OpenSSL::SSL::TLS1_2_VERSION
    ssl_context.cert = OpenSSL::X509::Certificate.new(File.read(ssl_cert_path))
    ssl_context.key = OpenSSL::PKey.read(File.read(ssl_key_path))
    ssl_context.set_params(verify_mode: OpenSSL::SSL::VERIFY_NONE)
    ssl_context
  end
end

hostname = File.basename(__dir__)
service hostname do
  include Falcon::Environment::Rack

  if Rails.env.development?
    endpoint do
      allow_ssl = ENV.fetch('SSL') == 'true'
      ssl_cert_path = ENV.fetch('SSL_CERT', nil)
      ssl_key_path = ENV.fetch('SSL_KEY', nil)
      ssl_context = SSLContextHelper.get_ssl_context(ssl_key_path, ssl_cert_path, allow_ssl)

      Async::HTTP::Endpoint.for(
        allow_ssl ? 'https' : 'http',
        '0.0.0.0', '/',
        port: ENV.fetch('PORT', 3030).to_i,
        ssl_context: allow_ssl && ssl_context
      ).with(protocol: Async::HTTP::Protocol::HTTP11)
    end
  else
    endpoint do
      Async::HTTP::Endpoint.for(
        'http',
        '0.0.0.0', '/',
        port: ENV.fetch('PORT', 3030).to_i,
        ssl_context: nil
      ).with(protocol: Async::HTTP::Protocol::HTTP11)
    end
  end
end
