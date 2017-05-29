module Licenses
  class AssignReportOrgSurvey
    # licenseable - it's AssignReport
    def self.use(licenseable)
      membership = licenseable.assign.membership
      report = licenseable.report
      client = membership.client
      client = client.client unless client.tenancy?
      return if client.retail?
      return if client.id == report.owner_id

      # Get License by report family type
      license = client.licenses.with_report_family(report.report_family_ids).take

      # Return if report has already assigned
      report_ids = Membership.client_reports(client.descendants.ids).map(&:id)
      return if license && report_ids.include?(report.id)

      # Add error to Assign if tenancy has no enough licenses
      unless license&.enough_licenses?
        assign = licenseable.assign
        assign.errors.add(:base, :has_no_enough_licenses) if assign.errors.empty?
        raise ActiveRecord::RecordInvalid
      end

      return unless membership.excess_yti_eti?(report)

      # Build License Usage for save history of usage
      licenseable.license_usages.build(license: license, client: membership.client)
    end
  end
end
