# frozen_string_literal: true

module Administration
  class BasePolicy
    attr_reader :user, :project_id, :membership, :record

    def initialize(context, record, _extra = {})
      @user = context[:user]
      @project_id = context[:project_id]
      @membership = user_membership
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
      attr_reader :user, :scope

      def initialize(context, scope)
        @user = context[:user]
        @scope = [scope].flatten.last
      end

      # scope - could be array [:administration, Model]
      def resolve
        [scope].flatten.last
      end
    end

    private

    def user_membership
      project = Client.find_by(id: @project_id)
      membership_client_id = @user.is?(:client_admin) ? project.parent_id : project.id
      @user_membership ||= Membership.find_by(client_id: membership_client_id)
    end
  end
end
