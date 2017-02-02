module Licenses
  class SubTenancies
    # licenseable - it's Client
    def self.use(licenseable)
      return if licenseable.tenancy?
      # Get License with users type
      license = licenseable.parent.licenses.sub_tenancies.first
      # Add error to tenancy if has no enough licenses
      unless license&.enough_licenses?
        licenseable.errors.add(:base, :has_no_enough_licenses)
        raise ActiveRecord::RecordInvalid
      end

      # Build License Usage for save history of usage
      licenseable.license_usages.build(license: license)
    end
  end
end
