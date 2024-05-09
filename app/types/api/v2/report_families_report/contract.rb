# frozen_string_literal: true

module Api
  module V2
    module ReportFamiliesReport
      class Contract < Api::Base::Contract
        config.messages.namespace = :report_families_reports

        schema Api::V2::ReportFamiliesReport::Schema.create_request

        rule(data: { relationships: { report: { data: :id } } }) do
          report_family_id = _context[:params]['report_family_id']

          if report_exists?(value, report_family_id)
            key.failure(:report_exists)
          end
        end

        private

        def report_exists?(report_id, report_family_id)
          ::ReportFamiliesReport.exists?(report_id: report_id, report_family_id: report_family_id)
        end
      end
    end
  end
end
