# frozen_string_literal: true

class Administration::UserPolicy < Administration::BasePolicy
  def index?
    @user.is?(:superadmin) || @user.has_grant?(:projects, :manage_users)
  end

  def send_mail?
    (
      @user.is?(:superadmin) || @user.has_permission?(:projects, :manage_users, project_id: project_id)
    ) && !@record.is_anonym?
  end

  def change_password?
    @user.is?(:superadmin) || @user.has_permission?(
      :projects, :manage_users, project_id: project_id
    )
  end

  def new?
    create?
  end

  def create?
    @user.is?(:superadmin, :client_admin, :project_admin)
  end

  def import?
    create?
  end

  def search_admins?
    @user.is?(:superadmin) || @user.has_grant?(:projects, :manage_users) || @user.has_grant?(:assessors, :manage)
  end

  def create_superadmin?
    @user.is?(:superadmin)
  end

  def roles?
    index?
  end

  def edit?
    update?
  end

  def update?
    @user.is?(:superadmin) || @user.is?(:assessor) || @user.has_permission?(
      :projects, :manage_users, project_id: project_id
    )
  end

  def toggle_status?
    (@user.is?(:superadmin) || @user.has_grant?(:projects, :manage_users)) && !@record.is_anonym?
  end

  def toggle_enable_2fa?
    (@user.is?(:superadmin) || @user.has_grant?(:projects, :manage_users)) && !@record.is_anonym?
  end

  def toggle_membership_status?
    current_user_record = @record.is_a?(Membership) ? @record.user : @record
    return true if @user.is?(:superadmin)
    return true if @user.is?(:client_admin) && current_user_record.is?(:project_admin, :regular)
    return true if @user.is?(:project_admin) && current_user_record.is?(:regular)

    false
  end

  def destroy?
    @user.is?(:superadmin) || @user.has_grant?(:projects, :manage_users)
  end

  def export?
    @user.is?(:superadmin) || @user.has_grant?(:projects, :manage_users)
  end

  def export_completion_status?
    @user.is?(:superadmin) || @user.has_grant?(:projects, :manage_users)
  end

  def spoof?
    @user.is?(:superadmin) && !@record.is?(:superadmin)
  end

  def assign_multiple?
    @user.is?(:superadmin, :client_admin, :project_admin)
  end

  def unlock_user_access?
    @user.is?(:superadmin) && @record.access_locked?
  end

  # @deprecated
  def manage_grants?
    @user.is?(:superadmin, :client_admin) && @record.scope == :administration
  end

  # @deprecated
  def manage_grants_for_action?(resource, action)
    @user.is?(:superadmin) || @user.has_grant?(resource, action)
  end

  # @deprecated
  def manage_grants_for_actions?(resource, actions)
    return true if @user.is?(:superadmin)

    (@user.grants || {}).key?(resource) && @user.grants[resource].intersect?(actions)
  end

  class Scope < Administration::BasePolicy::Scope
    def resolve
      return scope if superadmin_bypass?

      project_ids = @user.is?(:client_admin) ? @user.client_admin_project_ids : @user.project_admin_client_ids

      permitted_project_ids = project_ids.select do |project_id|
        @user.has_permission?(:projects, :manage_users, project_id: project_id)
      end

      scope.where(project_id: restrict_to_client_subtree(permitted_project_ids))
    end
  end
end
