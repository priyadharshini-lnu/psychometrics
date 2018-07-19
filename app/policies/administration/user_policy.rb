class Administration::UserPolicy < Administration::BasePolicy
  def index?
    @user.is?(:superadmin, :client_admin, :project_admin)
  end

  def new?
    create?
  end

  def create?
    @user.is?(:superadmin, :client_admin, :project_admin)
  end

  def create_superadmin?
    @user.is?(:superadmin)
  end

  def edit?
    update?
  end

  def update?
    @user.is?(:superadmin, :client_admin, :project_admin)
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

  def export_completion_status?
    index?
  end

  def import?
    create?
  end

  def spoof?
    @user.is?(:superadmin, :client_admin, :project_admin) && !@record.is_anonym?
  end

  def assign_multiple?
    @user.is?(:superadmin, :client_admin, :project_admin)
  end

  def send_mail?
    @user.is?(:superadmin, :client_admin, :project_admin) && !@record.is_anonym?
  end

  def change_password?
    @user.is?(:superadmin, :client_admin, :project_admin) && !@record.is_anonym?
  end

  def manage_grants?
    @user.is?(:superadmin, :client_admin) && @record.scope == :administration
  end

  def manage_grants_for_action?(resource, action)
    @user.is?(:superadmin) || @user.has_grant?(resource, action)
  end

  def manage_grants_for_actions?(resource, actions)
    return true if @user.is?(:superadmin)
    (@user.grants || {}).key?(resource) && (@user.grants[resource] & actions).any?
  end

  class Scope < Administration::BasePolicy::Scope
    def resolve
      return scope if @user.is?(:superadmin)
      client_ids = @user.is?(:client_admin) ? @user.client_admin_client_ids : @user.project_admin_client_ids
      scope.enabled.joins(:memberships).where(memberships: { client_id: client_ids })
    end
  end
end
