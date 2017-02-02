module Licenses
  class ClientReport
    # licenseable - it's Report
    def self.use(licenseable)
      return if licenseable.owner_id.nil?
      client = licenseable.owner
      client = client.parent if client.subtenancy?
      # Get Licens with 'client_report' type
      license = client.licenses.client_report.first
      # Add error to Report if client has no enough licenses
      unless license&.enough_licenses?
        licenseable.errors.add(:base, :has_no_enough_licenses)
        raise ActiveRecord::RecordInvalid
      end
      # Build License Usage for save history of usage
      licenseable.license_usages.build(license: license)
    end
  end
end
