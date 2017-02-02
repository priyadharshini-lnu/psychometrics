module Licenses
  class TenancyBranding
    # licenseable - it's Client
    def self.use(licenseable)
      license = licenseable.licenses.tenancy_branding.first

      raise_error(licenseable) unless license
      # Check if license is already in use
      license_usage = licenseable.license_usages.where(license_id: license.id)
      return if license_usage.any?

      raise_error(licenseable) unless license.enough_licenses?

      # Build License Usage for save history of usage
      licenseable.license_usages.build(license: license)
    end

    def self.raise_error(licenseable)
      licenseable.errors.add(:base, :has_no_enough_licenses)
      raise ActiveRecord::RecordInvalid
    end
  end
end
