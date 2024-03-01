# frozen_string_literal: true

class AdminRole < ApplicationRecord
  audited
  include AllowedPermissions

  has_many :memberships_admin_roles, dependent: :destroy
  has_many :memberships, through: :memberships_admin_roles

  def user_role_specific_permissions(membership)
    role = membership.role
    if role == 'campaign_admin' && membership.campaign.threesixty?
      role = 'threesixty_campaign_admin'
    end
    permissions.
      slice(*PERMISSION_BY_ADMIN_TYPE[role].keys).
      each_with_object({}) do |(permission, grants), allowed|
        allowed[permission] = grants.select do |grant|
          PERMISSION_BY_ADMIN_TYPE[role].fetch(permission).include?(grant)
        end
      end
  end
end
