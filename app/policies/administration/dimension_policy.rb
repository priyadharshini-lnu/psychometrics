class Administration::DimensionPolicy < Administration::BasePolicy
  def index?
    @user.is?(:superadmin, :admin)
  end

  def update?
    @user.is?(:superadmin, :admin)
  end

  class Scope < Scope
    def resolve
      scope = super
      return scope if @user.is?(:superadmin)
      scope.where(owner_id: [@user.client_ids])
    end
  end
end
