# frozen_string_literal: true

module Administration
  module Assessors
    class UserReportSerializer < Panko::Serializer
      attributes :id, :name, :internal, :status, :report_url, :unavailability_reason_details

      delegate :name, to: :report

      def internal
        report.provider_internal?
      end

      def report_url
        object.pdf_download_url
      end

      def unavailability_reason_details
        return if object.prepared?

        UserReports::UnavailabilityReasonDetails.new(object).query
      end

      private

      def report
        object.report
      end
    end
  end
end
