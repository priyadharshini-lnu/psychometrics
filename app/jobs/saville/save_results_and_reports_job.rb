# frozen_string_literal: true

module Saville
  class SaveResultsAndReportsJob < ApplicationJob
    queue_as :external_results

    def perform(response)
      parsed_response = Hash.from_xml(CGI.unescape(response))
      request_id = parsed_response.dig('AssessmentResult', 'ReceiptId', 'IdValue')
      saville_user_assessment = SavilleUserAssessment.find_by(request_id: request_id)
      return unless saville_user_assessment

      results = parsed_response.dig('AssessmentResult', 'Results')
      return results if results.blank?

      Array.wrap(results).each do |result|
        report_id = result.dig('SupportingMaterials', 'Id', 'IdValue').downcase
        user_report = saville_user_assessment.saville_user_reports.joins(:saville_report_setting).
                      find_by(saville_report_settings: { saville_report_id: report_id.downcase })

        next unless user_report

        pdf = "data:application/pdf;base64,#{result.dig('SupportingMaterials', 'EmbeddedData', 'EncodedContent')}"
        user_report.update(pdf: pdf, status: :prepared)
      end
    end
  end
end
