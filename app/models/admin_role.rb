# frozen_string_literal: true

class AdminRole < ApplicationRecord
  include AllowedPermissions

  belongs_to :membership

  has_and_belongs_to_many :users, join_table: :user_admin_roles

  def grantable_permissions
    permissions.
      slice(*PERMISSION_BY_ADMIN_TYPE[membership.role].keys).
      each_with_object({}) do |(permission, grants), allowed|
        allowed[permission] = grants.select do |grant|
          PERMISSION_BY_ADMIN_TYPE[membership.role].fetch(permission).include?(grant)
        end
      end
  end
end
