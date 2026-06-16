# frozen_string_literal: true

module UserRoles
  extend ActiveSupport::Concern

  # Roles constants
  SUPER_ADMIN_ROLE = 'Users::SuperAdmin'
  REGULAR_ROLE = 'Users::Regular'
  ADMIN_ROLE = 'Users::Admin'
  APPLICATION_ROLE = 'Users::Application'

  USER_ROLES = {
    superadmin: SUPER_ADMIN_ROLE,
    admin: ADMIN_ROLE,
    regular: REGULAR_ROLE,
    application: APPLICATION_ROLE
  }.freeze

  USER_ROLES_SCOPES = {
    administration: [
      USER_ROLES.key(SUPER_ADMIN_ROLE),
      :assessor,
      Membership::PROJECT_ADMIN_ROLE,
      Membership::CLIENT_ADMIN_ROLE,
      Membership::CAMPAIGN_ADMIN_ROLE
    ],
    user: [USER_ROLES.key(REGULAR_ROLE), Membership::MANAGER_ROLE, Membership::MEMBER_ROLE]
  }.freeze

  # Contain information about ability to manage list of roles
  USER_ROLES_HIERARCHY = {
    superadmin: USER_ROLES.values,
    regular: Membership::MEMBERSHIP_ROLES
  }.freeze

  def is?(*roles)
    roles.map!(&:to_sym)
    current_role = USER_ROLES.key(role)
    return roles.include?(current_role) if (roles - USER_ROLES.keys).blank?

    arr = if current_membership
            [current_membership.role.to_sym]
          else
            [current_role] + memberships.map { |m| m.role.to_sym }
          end
    arr << :assessor if global_assessor? || assessors.exists?
    arr.intersect?(roles)
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
    USER_ROLES_HIERARCHY[USER_ROLES.key(role)] || []
  end

  def has_grant?(scope, grant)
    return true if is?(:superadmin)

    memberships.any? { |m| m.has_grant?(scope, grant) }
  end

  def has_permission?(scope, grant, project_id: nil, campaign_id: nil)
    return true if is?(:superadmin)
    return false if project_id.nil? && campaign_id.nil?

    project = ActsAsTenant.without_tenant { Client.find(project_id) } if project_id
    project ||= ActsAsTenant.without_tenant { Campaign.find(campaign_id).project }

    project_based_client_ids = [].tap do |arr|
      arr.concat(project.tenancy? ? [project.id] : [project.id, project.parent_id])
    end.compact

    project_memberships = memberships.includes(:grants, :admin_roles).where(
      client_id: project_based_client_ids, role: [Membership::CLIENT_ADMIN_ROLE, Membership::PROJECT_ADMIN_ROLE]
    )

    campaign_memberships = memberships.includes(:grants, :admin_roles).where(campaign_id: campaign_id) if campaign_id

    (project_memberships + campaign_memberships.to_a).any? { |m| m.has_grant?(scope, grant) }
  end

  def superadmin?
    role == SUPER_ADMIN_ROLE
  end

  def application?
    role == APPLICATION_ROLE
  end

  def admin?
    project_id.nil?
  end

  def assessor?
    is?(:assessor)
  end
end
