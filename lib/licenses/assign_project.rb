module Licenses
  class AssignProject
    # licenseable - it's Assign
    def self.use(licenseable)
      client = licenseable.membership.client
      client = client.parent if client.subtenancy?
      license = client.licenses.assign_project.first
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
