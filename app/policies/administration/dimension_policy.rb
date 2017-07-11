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
        scope.where(owner_id: @user.admin_clients.select('tte_id').distinct)
      else
        scope.none
      end
    end
  end
end
