# frozen_string_literal: true

module Administration
  class BasePolicy
    attr_reader :user, :project_id, :campaign_id, :record

    def initialize(user, record, extra = {})
      @user = user
      @project_id = extra[:project_id]
      @campaign_id = extra[:campaign_id]
      @record = [record].flatten.last
    end

    def index?
      @user.is?(:superadmin)
    end

    def show?
      @user.is?(:superadmin)
    end

    def create?
      @user.is?(:superadmin)
    end

    def new?
      create?
    end

    def update?
      create?
    end

    def edit?
      update?
    end

    def destroy?
      create?
    end

    def copy?
      create?
    end

    def import?
      @user.is?(:superadmin)
    end

    def export?
      @user.is?(:superadmin)
    end

    def toggle_status?
      create?
    end

    def actions?
      edit? & copy? & destroy?
    end

    def scope
      Pundit.policy_scope!(user, record.class)
    end

    def has_permission?(resource_type, permission, options = {})
      @user.has_permission?(
        resource_type,
        permission,
        project_id: options[:project_id] || project_id,
        campaign_id: options[:campaign_id] || campaign_id
      )
    end

    class Scope
      attr_reader :user, :scope

      def initialize(user, scope, _opts = {})
        @user = user
        @scope = [scope].flatten.last
      end

      # scope - could be array [:administration, Model]
      def resolve
        [scope].flatten.last
      end
    end
  end
end
