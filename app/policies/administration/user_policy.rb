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

  def create_superadmin?
    @user.is?(:superadmin)
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
    update? && !@record.is_anonym?
  end

  def export?
    index?
  end

  def import?
    create?
  end

  def spoof?
    @user.is?(:superadmin, :admin) && !@record.is_anonym?
  end

  def assign_multiple?
    @user.is?(:superadmin, :admin)
  end

  def send_mail?
    @user.is?(:superadmin, :admin) && !@record.is_anonym?
  end

  def change_password?
    @user.is?(:superadmin, :admin) && !@record.is_anonym?
  end

  class Scope < Administration::BasePolicy::Scope
    def resolve
      return scope if @user.is?(:superadmin)
      scope.enabled.joins(:memberships).where(memberships: { client_id: @user.admin_client_ids })
    end
  end
end
