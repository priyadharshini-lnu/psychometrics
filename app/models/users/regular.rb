# frozen_string_literal: true

module Users
  class Regular < User
    def scope
      :user
    end

    def project_membership
      Membership.find_by(client_id: project.id, user_id: id)
    end

    def generate_sso_token(ttl = 30.minutes)
      token = SecureRandom.urlsafe_base64(20, false)
      $redis.setex(sso_key, ttl, token)
      token
    end

    def sso_key
      "sso/#{id}/#{project_id}"
    end
  end
end
