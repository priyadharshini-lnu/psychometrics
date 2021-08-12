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

      is_client_admin_user = @user.is?(:client_admin)
      clients = is_client_admin_user ? @user.client_admin_clients : @user.project_admin_clients
      permitted_clients = clients.select { |client| @user.has_permission?(:norms, :view, client.id) }
      permitted_owner_ids = is_client_admin_user ? permitted_clients.pluck(:id) : permitted_clients.pluck(:tte_id)
      scope.where(owner_id: permitted_owner_ids.uniq)
    end
  end
end
