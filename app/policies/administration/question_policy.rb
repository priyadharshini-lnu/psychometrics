# frozen_string_literal: true

module Administration
  class QuestionPolicy < Administration::BasePolicy
    def index?
      @user.is?(:superadmin) || @user.has_grant?(:questions, :view)
    end

    def create?
      @user.is?(:superadmin) || @user.has_grant?(:questions, :manage)
    end

    def edit?
      @user.is?(:superadmin) || @user.has_grant?(:questions, :manage)
    end

    def copy?
      @user.is?(:superadmin) || @user.has_grant?(:questions, :manage)
    end

    def destroy?
      @user.is?(:superadmin) || @user.has_grant?(:questions, :manage)
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
