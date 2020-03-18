# frozen_string_literal: true

module License
  class GetStats < BaseCommand

    def initialize()
    end

    def call
      stats = get_stats
      broadcast :ok, stats
    end

    private

    def get_stats
      expiring_licenses = License.where(
        'end_date > ? AND end_date < ?', Time.now, Time.now + 30.days
      ).includes(:client)

      license_usages = LicenseUsage.active.where(
        'created_at > ? AND created_at < ?', Time.now - 7.days, Time.now
      ).group(:license_id).count

      used_licenses = License.where(id: license_usages.keys).includes(:client)

      get_hash(expiring_licenses, used_licenses, license_usages)
    end

    def get_hash(expiring_licenses, used_licenses, license_usages)
      hash = {
        expiring_licenses: [],
        used_licenses: []
      }
      expiring_licenses.each do |expiring_license|
        hash[:expiring_licenses].push(
          client_name: expiring_license.client.name,
          license_end_date: expiring_license.end_date,
          account_manager: User.find(expiring_license.client.account_manager_id).decorate.display_name,
          project_manager: User.find(expiring_license.client.project_manager_id).decorate.display_name
        )
      end

      used_licenses.each do |used_license|
        hash[:used_licenses].push(
          client_name: used_license.client.name,
          license_end_date: used_license.end_date,
          type: used_license.type,
          use_count: license_usages[used_license.id],
          overuse_count: used_license.overuse_number,
          remaining_count: used_license.number - used_license.used_number
        )
      end

      hash
    end
  end
end
