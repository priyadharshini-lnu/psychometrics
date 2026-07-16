# frozen_string_literal: true

module AdminAuth
  class ConsumeHandoffToken < BaseCommand
    def initialize(token, expected_client_id:)
      @token = token
      @expected_client_id = expected_client_id
    end

    def call
      return broadcast(:error, :blank_token) if token.blank?

      payload = verify_and_decode_token
      return broadcast(:error, :invalid_token) unless payload

      return broadcast(:error, :expired) if expired?(payload)
      return broadcast(:error, :client_mismatch) unless client_matches?(payload)
      return broadcast(:error, :already_used) unless consume_nonce(payload[:nonce])

      user = find_user(payload[:user_id])
      return broadcast(:error, :user_not_found) unless user
      return broadcast(:error, :user_disabled) unless user.active_for_authentication?

      broadcast(:ok, build_result(user, payload))
    end

    private

    attr_reader :token, :expected_client_id

    def verify_and_decode_token
      payload = Rails.application.message_verifier(verifier_purpose).verify(token)
      payload.is_a?(Hash) ? payload.with_indifferent_access : nil
    rescue ActiveSupport::MessageVerifier::InvalidSignature
      nil
    end

    def expired?(payload)
      payload[:exp].to_i < Time.current.to_i
    end

    def client_matches?(payload)
      payload[:client_id] == expected_client_id
    end

    def consume_nonce(nonce)
      return false if nonce.blank?

      # DEL returns 1 if key existed, 0 if not — atomic single-use
      $redis.del(cache_key(nonce)) == 1
    end

    def find_user(user_id)
      User.find_by(id: user_id)
    end

    def build_result(user, payload)
      {
        user: user,
        client_id: payload[:client_id],
        impersonated_by_id: payload[:impersonated_by_id]
      }
    end

    def cache_key(nonce)
      "#{HANDOFF_CACHE_PREFIX}:#{nonce}"
    end

    def verifier_purpose
      HANDOFF_VERIFIER_PURPOSE
    end
  end
end
