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
        scope.where(owner_id: [@user.admin_client_ids])
      else
        scope.none
      end
    end
  end
end
