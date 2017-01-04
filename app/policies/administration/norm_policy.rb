class Administration::NormPolicy < Administration::BasePolicy
  def index?
    @user.is?(:superadmin, :admin)
  end

  def update?
    @user.is?(:superadmin, :admin)
  end

  def import?
    create?
  end

  def editor?
    create?
  end

  def change_cell?
    create?
  end

  def export?
    @user.is?(:superadmin)
  end

  class Scope < Scope
    def resolve
      collection = [scope].flatten.last
      return collection if @user.is?(:superadmin)
      collection.where(owner_id: [@user.client_ids])
    end
  end
end
