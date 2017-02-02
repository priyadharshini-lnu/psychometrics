module Licenses
  class AssignOrgSurvey
    # licenseable - it's Assign
    def self.use(licenseable)
      client = licenseable.membership.client
      client = client.parent if client.subtenancy?
      return if client.retail?
      return if client.id == licenseable.assignable.owner_id

      # Get License with 'assign_individual_assessment' type
      license = client.licenses.assign_individual_assessment.where(assessment_id: licenseable.assignable_id).first

      # Get License with 'assign_org_survey' type
      license = client.licenses.assign_org_survey.first unless license&.enough_licenses?

      # Add error to Assign if tenancy has no enough licenses
      unless license&.enough_licenses?
        licenseable.errors.add(:base, :has_no_enough_licenses)
        raise ActiveRecord::RecordInvalid
      end

      # Build License Usage for save history of usage
      licenseable.license_usages.build(license: license)
    end
  end
end
