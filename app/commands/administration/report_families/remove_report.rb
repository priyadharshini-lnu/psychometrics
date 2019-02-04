# frozen_string_literal: true

module Administration
  module ReportFamilies
    class RemoveReport < Rectify::Command
      def initialize(report_id, report_family)
        @report_id = report_id.to_i
        @report_family = report_family
      end

      def call
        report_family.report_ids -= [report_id]

        broadcast(:ok)
      end

      private

      attr_reader :report_id, :report_family
    end
  end
end
