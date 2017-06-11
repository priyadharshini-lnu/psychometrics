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
        owner_ids = @user.admin_clients.joins(:tte).pluck('clients.tte_id')
        scope.where(owner_id: owner_ids)
      else
        scope.none
      end
    end
  end
end
