# frozen_string_literal: true

class ApiKey < ApplicationRecord
  belongs_to :user, class_name: 'User', inverse_of: :api_keys

  scope :active, -> { where.not(disabled: true) }

  before_create :generate_token, unless: :token

  private

  # Generates API token
  #
  def generate_token
    key = ActiveSupport::KeyGenerator.
          new(Devise.secret_key).
          generate_key(Rails.application.secrets.secret_token_for_generate.to_s)

    loop do
      raw = SecureRandom.urlsafe_base64(nil, false)
      self.token = OpenSSL::HMAC.hexdigest('SHA256', key, raw)

      break [raw, token] unless self.class.exists?(token: token)
    end
  end
end
