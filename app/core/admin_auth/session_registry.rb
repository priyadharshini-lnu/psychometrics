# frozen_string_literal: true

module AdminAuth
  class SessionRegistry
    def self.recent_client_ids(user, impersonator: nil, limit: 3)
      scope = impersonator ? Session.impersonated.where(impersonator_id: impersonator.id) : Session.real
      scope.where(user_id: user.id).
        where.not(tenant_id: nil).
        group(:tenant_id).
        order(Arel.sql('MAX(updated_at) DESC')).
        limit(limit).
        pluck(:tenant_id)
    end

    def self.active_client_ids(user, impersonator: nil)
      scope = impersonator ? Session.impersonated.where(impersonator_id: impersonator.id) : Session.real
      scope.active.where(user_id: user.id).where.not(tenant_id: nil).distinct.pluck(:tenant_id)
    end

    def self.invalidate_all_real(user)
      Session.real.where(user_id: user.id).delete_all
    end

    def self.invalidate_all_impersonated(user, impersonator:)
      Session.impersonated.where(user_id: user.id, impersonator_id: impersonator.id).delete_all
    end

    def self.session_active?(user, client, impersonator: nil)
      scope = impersonator ? Session.impersonated.where(impersonator_id: impersonator.id) : Session.real
      scope.active.exists?(user_id: user.id, tenant_id: client.id)
    end
  end
end
