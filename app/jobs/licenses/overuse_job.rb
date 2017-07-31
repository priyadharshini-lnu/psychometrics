module Licenses
  class OveruseJob < ApplicationJob
    queue_as :default

    def perform(license_id)
      license = License.find license_id
      client = license.client
      client.memberships.admin_role.each do |membership|
        LicenseMailer.license_overuse(membership.user_id).deliver_later
      end
      User.where(role: User::SUPER_ADMIN_ROLE).find_each do |superadmin|
        LicenseMailer.license_overuse(superadmin.id, client.id).deliver_later
      end
    end
  end
end
