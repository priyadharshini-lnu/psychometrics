# frozen_string_literal: true

class CreateApiKey < Rectify::Command
  include SiemLogger::ControllerHelper

  def initialize(user)
    @user = user
  end

  def call
    generate_key_and_token
    @api_key = user.api_keys.new(key: key, token: token)

    return broadcast :ivalid unless api_key.save

    siem_log_token_issuance(user, 'API',
                            context: "User: #{SiemLogger.user_identifier(user.email, user.id)}")

    broadcast :ok, api_key
  end

  private

  attr_reader :user, :key, :token, :api_key

  def generate_key_and_token
    @token = SecureRandom.hex(32)
    @key = loop do
      possible_key = SecureRandom.uuid
      break possible_key unless ::ApiKey.exists?(key: possible_key)
    end
  end
end
