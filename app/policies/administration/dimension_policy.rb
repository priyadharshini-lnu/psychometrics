# frozen_string_literal: true

class Administration::DimensionPolicy < Administration::BasePolicy
  def index?
    super || @user.has_grant?(:dimensions, :view)
  end

  def create?
    super || @user.has_grant?(:dimensions, :manage)
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
