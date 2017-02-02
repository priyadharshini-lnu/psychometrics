module Licenses
  class AssignReportOrgSurvey
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

      # Get License with 'assign_report_org_survey' type
      license = client.licenses.assign_report_org_survey.first unless license&.enough_licenses?

      # Return if project already assigned
      report_ids = Membership.client_reports(client.sub_client_ids << client.id).map(&:id)
      return if license && report_ids.include?(report.id)

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
