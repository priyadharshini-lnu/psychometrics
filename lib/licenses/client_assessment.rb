module Licenses
  class ClientAssessment
    # licenseable - it's Assessment
    def self.use(licenseable)
      return if licenseable.owner_id.nil?
      client = licenseable.owner
      client = client.parent if client.subtenancy?
      # Get Licens with 'client_assessment' type
      license = client.licenses.client_assessment.first
      # Add error to Assessment if client has no enough licenses
      unless license&.enough_licenses?
        licenseable.errors.add(:base, :has_no_enough_licenses)
        raise ActiveRecord::RecordInvalid
      end
      # Build License Usage for save history of usage
      licenseable.license_usages.build(license: license)
    end
  end
end
