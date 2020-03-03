# frozen_string_literal: true

module UserRoles
  extend ActiveSupport::Concern

  included do
    # Roles constants
    SUPER_ADMIN_ROLE = 'Users::SuperAdmin'
    REGULAR_ROLE = 'Users::Regular'
    ADMIN_ROLE = 'Users::Admin'

    USER_ROLES = {
      superadmin: SUPER_ADMIN_ROLE,
      regular: REGULAR_ROLE,
      admin: ADMIN_ROLE
    }.freeze

    USER_ROLES_SCOPES = {
      administration: [USER_ROLES.key(SUPER_ADMIN_ROLE), Membership::PROJECT_ADMIN_ROLE, Membership::CLIENT_ADMIN_ROLE],
      user: [USER_ROLES.key(REGULAR_ROLE), Membership::MANAGER_ROLE, Membership::MEMBER_ROLE]
    }.freeze

    # Contain information about ability to manage list of roles
    USER_ROLES_HIERARCHY = {
      superadmin: USER_ROLES.values,
      regular: Membership::MEMBERSHIP_ROLES
    }.freeze

    validates :role, inclusion: { in: ::User::USER_ROLES.values }, presence: true, allow_nil: true
  end

  def is?(*roles)
    roles.map!(&:to_sym)
    arr = if current_membership
            [current_membership.role.to_sym]
          else
            [USER_ROLES.key(role)] + memberships.map { |m| m.role.to_sym }
          end
    (arr & roles).any?
  end

  # Return devise scope
  # :administration, :user
  def role_scope
    USER_ROLES_SCOPES.each do |scope, roles|
      break scope if is?(*roles)
    end
  end

  # Return true if current user/admin has ability to manage passed user
  def can_manage?(user)
    user.role && can_manage.include?(user.role)
  end

  # Return list of roles, that can manage
  def can_manage
    (USER_ROLES_HIERARCHY[USER_ROLES.key(role)] || [])
  end

  def has_grant?(scope, grant)
    memberships.any? { |m| m.has_grant?(scope, grant) }
  end

  def superadmin?
    role == SUPER_ADMIN_ROLE
  end

  def admin?
    is?(:superadmin, :client_admin, :project_admin)
  end
end
