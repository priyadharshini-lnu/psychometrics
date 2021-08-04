# frozen_string_literal: true

class Administration::NormPolicy < Administration::BasePolicy
  def index?
    @user.is?(:superadmin) || @user.has_grant?(:norms, :view)
  end

  def create?
    @user.is?(:superadmin) || @user.has_grant?(:norms, :manage)
  end

  def editor?
    @user.is?(:superadmin)
  end

  def edit?
    @user.is?(:superadmin) || @user.has_permission?(:norms, :manage, project_id)
  end

  def copy?
    @user.is?(:superadmin) || @user.has_permission?(:norms, :manage, project_id)
  end

  def actions?
    edit? & copy? & destroy?
  end

  def import?
    @user.is?(:superadmin) || @user.has_grant?(:norms, :manage)
  end

  def export?
    @user.is?(:superadmin) || @user.has_permission?(:norms, :view, project_id)
  end

  def change_cell?
    @user.is?(:superadmin)
  end

  class Scope < Scope
    def resolve
      scope = super
      return scope if @user.is?(:superadmin)

      owner_ids = @user.is?(:client_admin) ? @user.client_admin_client_ids : @user.project_admin_clients_tte_ids

      permitted_owner_ids = owner_ids.uniq.select { |owner_id| @user.has_permission?(:norms, :view, owner_id) }

      scope.where(owner_id: permitted_owner_ids)
    end
  end
end
