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
      can_manage_question?
    end

    def copy?
      can_manage_question?
    end

    def destroy?
      can_manage_question?
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

    private

    def can_manage_question?
      @user.is?(:superadmin) || @user.has_permission?(:questions, :manage, project_id: @record.owner_id)
    end

    class Scope < Scope
      def resolve
        scope = super
        scope = scope.order(:name)
        return scope if @user.is?(:superadmin)

        owner_ids = @user.is?(:client_admin) ? @user.client_admin_client_ids : @user.project_admin_clients_tte_ids

        permitted_owner_ids = owner_ids.uniq.select do |owner_id|
          @user.has_permission?(:questions, :view, project_id: owner_id)
        end

        scope.where(owner_id: permitted_owner_ids.push(nil))
      end
    end
  end
end
