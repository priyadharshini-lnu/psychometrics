# frozen_string_literal: true

class Administration::DimensionPolicy < Administration::BasePolicy
  def index?
    @user.is?(:superadmin) || @user.has_grant?(:dimensions, :view)
  end

  def create?
    @user.is?(:superadmin) || @user.has_grant?(:dimensions, :manage)
  end

  def destroy?
    @user.is?(:superadmin) || @user.has_grant?(:dimensions, :manage)
  end

  def edit?
    @user.is?(:superadmin) || @user.has_grant?(:dimensions, :manage)
  end

  def update?
    @user.is?(:superadmin) || @user.has_grant?(:dimensions, :manage)
  end

  def copy?
    @user.is?(:superadmin) || @user.has_grant?(:dimensions, :manage)
  end

  def actions?
    edit? & copy? & destroy?
  end

  class Scope < Scope
    def resolve
      scope = super
      return scope if @user.is?(:superadmin)

      if @user.has_grant?(:dimensions, :view)
        owner_ids =
          if @user.is?(:client_admin)
            @user.client_admin_clients.ids
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
