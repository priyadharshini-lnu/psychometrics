# frozen_string_literal: true

class Administration::NormPolicy < Administration::BasePolicy
  def index?
    super || @user.has_grant?(:norms, :view)
  end

  def create?
    super || @user.has_grant?(:norms, :manage)
  end

  def editor?
    @user.is?(:superadmin)
  end

  def change_cell?
    @user.is?(:superadmin)
  end

  class Scope < Scope
    def resolve
      scope = super
      return scope if @user.is?(:superadmin)

      if @user.has_grant?(:norms, :view)
        owner_ids = @user.is?(:client_admin) ? @user.client_admin_client_ids : @user.project_admin_clients.select('tte_id').distinct
        scope.where(owner_id: owner_ids)
      else
        scope.none
      end
    end
  end
end
