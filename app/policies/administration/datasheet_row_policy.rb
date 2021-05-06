# frozen_string_literal: true

module Administration
  class DatasheetRowPolicy < Administration::BasePolicy
    def bulk_delete?
      create?
    end

    def create?
      @user.is?(:superadmin) || @user.has_grant?(:datasheets, :manage)
    end

    def index?
      @user.is?(:superadmin) || @user.has_grant?(:datasheets, :view)
    end

    def show?
      @user.is?(:superadmin) || @user.has_grant?(:datasheets, :view)
    end

    def update?
      @user.is?(:superadmin) || @user.has_grant?(:datasheets, :manage)
    end

    def destroy?
      @user.is?(:superadmin) || @user.has_grant?(:datasheets, :manage)
    end

    def save_column_preference?
      create?
    end

    def import?
      @user.is?(:superadmin) || @user.has_grant?(:datasheets, :manage)
    end

    def export?
      @user.is?(:superadmin) || @user.has_grant?(:datasheets, :manage)
    end
  end
end
