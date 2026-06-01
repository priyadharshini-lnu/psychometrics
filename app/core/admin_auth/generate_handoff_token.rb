# frozen_string_literal: true

module AdminAuth
  class GenerateHandoffToken < BaseCommand
    EXPIRY = 2.minutes
    CACHE_PREFIX = 'admin_handoff'

    def initialize(user, client, impersonated_by: nil)
      @user = user
      @client = client
      @impersonated_by_id = impersonated_by&.id
    end

    def call
      return broadcast(:error, :invalid_user) unless valid_user?
      return broadcast(:error, :invalid_client) unless valid_client?

      token = generate_secure_token
      broadcast(:ok, token)
    end

    private

    attr_reader :user, :client, :impersonated_by_id

    def valid_user?
      user.present? && user.active_for_authentication?
    end

    def valid_client?
      client.present? && client.active?
    end

    def generate_secure_token
      nonce = SecureRandom.urlsafe_base64(24)
      payload = build_payload(nonce)
      signed_token = sign_payload(payload)

      store_nonce_for_single_use(nonce)

      signed_token
    end

    def build_payload(nonce)
      {
        user_id: user.id,
        client_id: client.id,
        nonce: nonce,
        impersonated_by_id: impersonated_by_id,
        exp: EXPIRY.from_now.to_i
      }
    end

    def sign_payload(payload)
      Rails.application.message_verifier(verifier_purpose).generate(payload)
    end

    def store_nonce_for_single_use(nonce)
      $redis.set(cache_key(nonce), '1', ex: EXPIRY.to_i)
    end

    def cache_key(nonce)
      "#{CACHE_PREFIX}:#{nonce}"
    end

    def verifier_purpose
      'admin_handoff_token'
    end
  end
end
