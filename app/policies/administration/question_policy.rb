# frozen_string_literal: true

module Administration
  class QuestionPolicy < Administration::BasePolicy
    def index?
      super || @user.has_grant?(:questions, :view)
    end

    def create?
      super || @user.has_grant?(:questions, :manage)
    end

    def edit?
      create?
    end

    def copy?
      create?
    end

    def destroy?
      create?
    end

    def actions?
      edit? | copy? | destroy?
    end

    def open_channel?
      @user.is?(:superadmin)
    end

    def new_assign?
      @user.is?(:superadmin) || @user.has_grant?(:questions, :manage)
    end

    class Scope < Scope
      def resolve
        scope = super
        return scope if @user.is?(:superadmin)

        if @user.has_grant?(:questions, :view)
          owner_ids =
            if @user.is?(:client_admin)
              @user.client_admin_client_ids
            else
              @user.project_admin_clients.select('tte_id').distinct
            end
          scope.where(owner_id: owner_ids)
        else
          scope.none
        end
      end
    end
  end
end
