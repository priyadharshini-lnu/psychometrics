module Licenses
  class UsersLicense
    # licenseable - it's Memebership
    def self.use(licenseable)
      return if licenseable.client.subtenancy?
      return if licenseable.client.retail?
      # Get Licens with users type
      license = licenseable.client.licenses.users.first
      # Add error to membership if client has no enough licenses
      unless license&.enough_licenses?
        licenseable.errors.add(:base, :has_no_enough_licenses)
        raise ActiveRecord::RecordInvalid
      end
      # Build License Usage for save history of usage
      licenseable.license_usages.build(license: license)
    end
  end
end
