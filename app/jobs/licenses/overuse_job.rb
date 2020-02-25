# frozen_string_literal: true

module Licenses
  class OveruseJob < ApplicationJob
    queue_as :default

    def perform(license_id)
      license = License.find license_id
      client = license.client
      client.memberships.project_admin_role.each do |membership|
        LicenseMailer.license_overuse(membership.user_id).deliver_later
      end
      User.enabled_super_admins.find_each do |superadmin|
        LicenseMailer.license_overuse(superadmin.id, client.id).deliver_later
      end
    end
  end
end
