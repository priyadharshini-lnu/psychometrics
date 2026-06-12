# frozen_string_literal: true

# Overrides Devise's session_limitable for client admin context.
# For client admin: Store/retrieve session token from Redis (client-scoped, one per user+client).
# For root domain: Use Devise's default (users.unique_session_id column).
# Note: Impersonation sessions skip session_limitable via Devise's skip_session_limitable option.
module SubdomainSessionLimitable
  SESSION_EXPIRY = 24.hours.to_i

  def skip_session_limitable?
    Settings.features.skip_session_limitable
  end

  def update_unique_session_id!(unique_session_id)
    if Current.client_admin_context? && Current.client.present?
      store_client_session_limitable_token(unique_session_id)
    else
      super
    end
  end

  def unique_session_id
    if Current.client_admin_context? && Current.client.present?
      fetch_client_session_limitable_token
    else
      super
    end
  end

  private

  def store_client_session_limitable_token(token)
    $redis.set(session_limitable_key, token, ex: SESSION_EXPIRY)
  end

  def fetch_client_session_limitable_token
    $redis.get(session_limitable_key)
  end

  def session_limitable_key
    "session_limitable:#{id}:#{Current.client&.id}"
  end
end
