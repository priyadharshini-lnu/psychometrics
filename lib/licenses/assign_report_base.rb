module Licenses
  class AssignReportBase
    def initialize(licenseable)
      @licenseable  = licenseable
      @report       = licenseable.report
      @membership   = licenseable.assign.membership
      @user         = membership.user
      @client       = membership.client
      @client       = client.client unless client.tenancy?

      # Returns if client is not retail
      return if client.retail?

      # Returns if client is owner of the report
      return if client.id == report.owner_id

      build_license
    end

    # licenseable - it's AssignReport
    def self.use(licenseable)
      license_usage = self.new(licenseable)
      license_usage
    end

    private

    attr_reader :licenseable, :membership, :user, :report, :client

    def build_license
      # Get License by report family type
      licenses = fetch_licenses

      # Returns if license was already used by another Report from Report Family
      # TASK: gitlab.com/tte-lighthouse/psychometrics/issues/48
      return if user.license_usages.where(license: licenses).exists?

      # Detects first license which has enough free space
      license = licenses.detect(&:enough_licenses?)

      # Add error to Assign if tenancy has no enough licenses
      raise Errors::LicenseError.new(client, report, user) unless license

      # Build License Usage for save history of usage
      licenseable.license_usages.build(license: license, client: client, user: user)
    end

    def fetch_licenses
      client.licenses.available.with_report_family(report.report_family_ids).order(end_date: :asc)
    end
  end
end
