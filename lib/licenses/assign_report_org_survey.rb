module Licenses
  class AssignReportOrgSurvey < AssignReportBase

    private

    def build_license
      # Get License by report family type
      licenses = fetch_licenses

      # Returns if report has already assigned
      report_ids = Membership.user_reports(client.descendants.ids).map(&:id)
      return if licenses && report_ids.include?(report.id)

      # Returns if license was already used by another Report from Report Family
      # TASK: gitlab.com/tte-lighthouse/psychometrics/issues/48
      return if user.license_usages.where(license: licenses).exists?

      # Detects first license which has enough free space
      license = licenses.detect(&:enough_licenses?)

      # Add error to Assign if tenancy has no enough licenses
      raise Errors::LicenseError.new(client, report, user) unless license

      # Build License Usage for save history of usage
      licenseable.license_usages.build(license: license, client: client)
    end
  end
end
