# frozen_string_literal: true

module LicenseManager
  LICENSE_MANAGERS = {
    'common' => LicenseManager::Common,
    'threesixty' => LicenseManager::Threesixty,
    'proctoring' => LicenseManager::Proctoring,
    'idp' => LicenseManager::Idp
  }.freeze

  def self.get_applicable_licenses(license_type, client, context)
    licenses = client.licenses.not_expired.where(type: license_type).order(end_date: :asc)

    licenses = licenses.where(report_family_id: context[:report_family_id]) if license_type == 'common'

    licenses
  end

  def self.get_valid_license_manager(license)
    manager_class = LICENSE_MANAGERS[license.type]
    return manager_class if manager_class.present?

    raise NotImplementedError, "License manager for type #{license.type} is not implemented"
  end
end
