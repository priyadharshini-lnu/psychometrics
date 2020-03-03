# frozen_string_literal: true

namespace :license do
  desc 'Check expired licenses'

  task check_expire: :environment do
    License.where(end_date: Date.today).find_each do |license|
      Membership.project_admin_role.with_client(license.client_id).find_each do |membership|
        LicenseMailer.license_expire(membership.user_id).deliver_later
      end
      User.enabled_super_admins.find_each do |superadmin|
        LicenseMailer.license_expire(superadmin.id, license.client_id).deliver_later
      end
    end
  end
end
