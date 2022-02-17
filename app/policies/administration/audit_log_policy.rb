# frozen_string_literal: true

module Administration
  class AuditLogPolicy < Administration::BasePolicy
    def index?
      @user.is?(:superadmin)
    end

    def show?
      @user.is?(:superadmin)
    end

    def actions?
      @user.is?(:superadmin)
    end

    class Scope < Administration::BasePolicy::Scope
      def resolve
        return scope if @user.is?(:superadmin)
      end
    end
  end
end
