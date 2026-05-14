# frozen_string_literal: true

module Administration
  class BlockPolicy < Administration::BasePolicy
    def index?
      super || @user.has_grant?(:questions, :view)
    end

    def edit?
      can_manage_block?
    end

    def create?
      super || @user.has_grant?(:questions, :manage)
    end

    def update?
      can_manage_block?
    end

    def destroy?
      can_manage_block?
    end

    def copy?
      can_manage_block?
    end

    def actions?
      edit? | copy? | destroy?
    end

    def open_channel?
      @user.is?(:superadmin)
    end

    def new_assign?
      @user.is?(:superadmin)
    end

    def preview?
      @user.is?(:superadmin)
    end

    private

    def can_manage_block?
      @user.has_permission?(:questions, :manage, project_id: @record.owner_id)
    end
  end
end
