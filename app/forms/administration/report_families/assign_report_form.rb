# frozen_string_literal: true

module Administration
  module ReportFamilies
    class AssignReportForm < Rectify::Form
      # Fields
      attribute :report_id, String

      #   VALIDATIONS
      #
      validates :report_id, presence: true
      validate :report_uniqueness
      validate :report_is_enabled

      protected

      def report_uniqueness
        errors.add(:report_id, :taken) if context.report_family.reports.exists?(id: report_id)
      end

      def report_is_enabled
        errors.add(:report_id, :invalid) unless ::Report.enabled.exists?(id: report_id)
      end
    end
  end
end
