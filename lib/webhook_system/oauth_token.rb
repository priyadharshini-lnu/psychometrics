# frozen_string_literal: true

module WebhookSystem
  class OauthToken
    def self.cache_key(subscription)
      raw = [
        subscription.id,
        subscription.updated_at
      ].join('|')
      "webhook_system/oauth_token/#{Digest::MD5.hexdigest(raw)}"
    end

    def self.clear_token(subscription)
      Rails.cache.delete(cache_key(subscription))
    end

    def self.fetch(subscription)
      token = read_token_from_cache(subscription)
      return token if token

      token = fetch_and_cache_token(subscription)
      unless token
        clear_token(subscription)
        raise "Unable to generate OAuth token for subscription with client_id #{subscription.oauth_client_id}"
      end
      token
    end

    def self.read_token_from_cache(subscription)
      Rails.cache.read(cache_key(subscription))
    end

    def self.fetch_and_cache_token(subscription)
      uri = URI(subscription.oauth_token_url)
      site = "#{uri.scheme}://#{uri.host}"
      token_url = uri.request_uri

      client = OAuth2::Client.new(
        subscription.oauth_client_id,
        subscription.oauth_client_secret,
        site: site,
        token_url: token_url
      )

      begin
        token_params = { grant_type: subscription.oauth_grant_type }
        token_params[:scope] = subscription.oauth_scope if subscription.oauth_scope.present?

        access_token = client.get_token(token_params)

        expires_in = access_token.expires_in
        cache_expiry = expires_in.to_i - 60
        if cache_expiry >= 60
          Rails.cache.write(cache_key(subscription), access_token.token, expires_in: cache_expiry)
        end
        access_token.token
      rescue OAuth2::Error => e
        raise WebhookSystem::Job::RequestFailed.new("OAuth2 token fetch failed: #{e.message}", 400, e.message)
      end
    end
  end
end
