# frozen_string_literal: true

module UserReports
  class ValidateBulkDownloadEligibility < BaseCommand
    private_attr_reader :user_report_ids, :locales

    def initialize(user_report_ids:, locales:)
      @user_report_ids = user_report_ids
      @locales = locales
    end

    def call
      report_count = UserReportPdf.where(
        user_report_id: user_report_ids,
        locale: locales
      ).joins(:pdf_file_attachment).count

      return broadcast(:invalid, I18n.t('admin.reports_not_found')) if report_count.zero?

      return broadcast(:invalid, I18n.t('admin.reports_limit_exceeded')) if report_count > 1000

      broadcast(:ok)
    end
  end
end
