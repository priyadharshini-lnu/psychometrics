# frozen_string_literal: true

module Administration
  class AuditLogPolicy < Administration::BasePolicy
    def index?
      access_audit_log?
    end

    def show?
      access_audit_log?
    end

    def actions?
      access_audit_log?
    end

    def schedule_export?
      @user.is?(:superadmin)
    end

    private

    def access_audit_log?
      return true if @user.is?(:superadmin)
      return false unless @user.is?(:client_admin)

      @user.has_grant?(:audit_logs, :view)
    end

    class Scope < Administration::BasePolicy::Scope
      def resolve
        return scope if @user.is?(:superadmin)
        return AuditLog.none unless @user.is?(:client_admin)

        permitted_client_admin_clients_ids = @user.client_admin_client_ids.select do |client_id|
          @user.has_permission?(:clients, :view, project_id: client_id)
        end

        AuditLog.where(client_id: permitted_client_admin_clients_ids)
      end
    end
  end
end
