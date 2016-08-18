class Administration::UserPolicy < Administration::BasePolicy
  def index?
    @user.is?(:superadmin, :admin)
  end

  def new?
    create?
  end

  def create?
    @user.is?(:superadmin, :admin)
  end

  def edit?
    update?
  end

  def update?
    @user.is?(:superadmin, :admin)
  end

  def toggle_status?
    update?
  end

  def reset_password?
    update?
  end

  def export?
    index?
  end

  def import?
    create?
  end

  def spoof?
    @user.can_manage?(@record)
  end

  class Scope < Administration::BasePolicy::Scope
    def resolve
      return scope if @user.is?(:superadmin)
      # TODO: uncomment it when will be created Client model
      scope # .where(client_id: @user.client_id)
    end
  end
end
