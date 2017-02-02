module Licenses
  class AssignReportPsychometrics
    # licenseable - it's AssignReport
    def self.use(licenseable)
      membership = licenseable.assign.membership
      report = licenseable.report
      client = membership.client
      client = client.parent if client.subtenancy?
      return if client.retail?
      return if client.id == report.owner_id

      # Get License with 'assign_individual_report' type
      license = client.licenses.assign_individual_report.where(report_id: licenseable.report_id).first

      # Get License with 'assign_report_psychometrics' type
      license = client.licenses.assign_report_psychometrics.first unless license&.enough_licenses?

      # Add error to AssignReport if tenancy has no enough licenses
      unless license&.enough_licenses?
        assign = licenseable.assign
        assign.errors.add(:base, :has_no_enough_licenses) if assign.errors.empty?
        raise ActiveRecord::RecordInvalid
      end

      return if membership.allows_yti_eti?(report)

      # Build License Usage for save history of usage
      licenseable.license_usages.build(license: license)
    end
  end
end
