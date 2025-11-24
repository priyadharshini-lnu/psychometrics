# frozen_string_literal: true

module Lti
  class Oauth2AccessToken < ApplicationRecord
    self.table_name = :lti_oauth2_access_tokens

    DEFAULT_EXPIRY = 1.hour

    belongs_to :project, class_name: 'Client'

    validates :token_hash, presence: true, uniqueness: true
    validates :expires_at, presence: true
    validates :scope, presence: true

    scope :active, -> { where(revoked: false).where('expires_at > ?', Time.current) }

    before_validation :set_expires_at, on: :create

    def self.create_token(project_id:, scope:, integration_id: nil, expires_in: DEFAULT_EXPIRY)
      raw_token = SecureRandom.hex(32)
      token_hash = Digest::SHA256.hexdigest(raw_token)

      token_record = create!(
        token_hash: token_hash,
        project_id: project_id,
        integration_id: integration_id,
        scope: Array(scope).join(' '),
        expires_at: expires_in.from_now
      )

      {
        raw_token: raw_token,
        token_record: token_record,
        expires_in: expires_in.to_i,
        token_type: 'Bearer'
      }
    end

    def self.find_by_token(raw_token)
      return nil if raw_token.blank?

      token_hash = Digest::SHA256.hexdigest(raw_token)
      active.find_by(token_hash: token_hash)
    end

    def expired?
      expires_at <= Time.current
    end

    def scopes_array
      scope.split
    end

    private

    def set_expires_at
      self.expires_at ||= DEFAULT_EXPIRY.from_now
    end
  end
end
