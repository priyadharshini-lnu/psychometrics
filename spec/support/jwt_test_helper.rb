# frozen_string_literal: true

module JwtTestHelper
  def build_rs256_jwt(private_key:, payload:, headers:)
    JWT.encode(payload, private_key, 'RS256', headers)
  end
end

RSpec.configure do |config|
  config.include JwtTestHelper
end
