# frozen_string_literal: true

class CleanupExpiredOauth2TokensJob < ApplicationJob
  queue_as :default

  def perform
    cutoff_time = 24.hours.ago

    expired_count = Lti::Oauth2AccessToken.
                    where('expires_at < ?', cutoff_time).
                    delete_all

    Rails.logger.info "Cleaned up #{expired_count} expired OAuth2 access tokens"

    revoked_count = Lti::Oauth2AccessToken.
                    where('revoked = ? AND updated_at < ?', true, 7.days.ago).
                    delete_all

    Rails.logger.info "Cleaned up #{revoked_count} old revoked OAuth2 access tokens"
  end
end
