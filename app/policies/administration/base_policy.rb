# frozen_string_literal: true

module Administration
  class BasePolicy
    attr_reader :user, :project_id, :for_project, :membership, :record

    def initialize(context, record, _extra = {})
      @user = context[:user]
      @project_id = context[:project_id]
      @for_project = context[:for_project]
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

    class Scope
      attr_reader :user, :project_id, :scope

      def initialize(context, scope)
        @user = context[:user]
        @project_id = context[:project_id]
        @scope = [scope].flatten.last
      end

      # scope - could be array [:administration, Model]
      def resolve
        [scope].flatten.last
      end
    end
  end
end
