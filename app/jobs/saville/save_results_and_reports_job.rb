# frozen_string_literal: true

require 'xmlsimple'

module Saville
  class SaveResultsAndReportsJob < ApplicationJob
    queue_as :external_results

    def perform(response)
      parsed_response = XmlSimple.xml_in(CGI.unescape(response), { 'ForceArray' => false, 'ForceContent' => true })
      request_id = parsed_response.dig('ReceiptId', 'IdValue', 'content')
      saville_user_assessment = SavilleUserAssessment.find_by(request_id: request_id)
      return unless saville_user_assessment

      results = Array.wrap(parsed_response['Results'])
      return results if results.blank?

      user_assessment = saville_user_assessment.user_assessment
      save_results(user_assessment, results)
      generate_internal_reports(user_assessment)
      results.each do |result|
        report_id = result.dig('SupportingMaterials', 'Id', 'IdValue', 'content')
        base64_report = result.dig('SupportingMaterials', 'EmbeddedData', 'EncodedContent', 'content')
        next if report_id.nil? || base64_report.nil?

        user_report = saville_user_assessment.user_reports(:saville).joins(:report).
                      find_by('reports.external_settings @> ?', { report_id: report_id }.to_json)

        next unless user_report

        user_report.attach_pdf!(base64_report)
      end
    end

    def save_results(user_assessment, results)
      results = {
        meta_data: parsed_meta_data(results),
        scores: parsed_scores(results)
      }
      user_assessment.users_result.update(external_results: results)
      user_assessment.completed!
    end

    def generate_internal_reports(user_assessment)
      ::UsersResults::GenerateReports.call(
        user_assessment.users_result,
        user_assessment.user,
        exceptUserReportIds: user_assessment.user_reports(:saville).pluck(:id)
      )
    end

    def parsed_meta_data(results)
      dates = results.dig(0, 'SupportingMaterials', 'EffectiveDate')
      return {} unless dates

      {
        start_date: dates.dig('StartDate', 'content'),
        end_date: dates.dig('EndDate', 'content')
      }
    end

    def parsed_scores(results)
      scores = results.each_with_object([]) do |result, acc|
        Array.wrap(result['DetailResult']).each do |factor|
          id = score_type = nil
          score_details = Array.wrap(factor.dig('CompetencyAssessed', 'CompetencyId', 'IdValue'))
          score_details.each do |id_or_score_type|
            id = id_or_score_type['content'] if id_or_score_type['name'] == 'Reference'
            score_type = id_or_score_type['content'] if id_or_score_type['name'] == 'Type'
          end
          acc << {
            id: id,
            score_type: score_type,
            value_type: factor.dig('Score', 'type'),
            score: factor.dig('Score', 'content')&.to_f
          }
        end
      end
      scores.uniq { |score| "#{score[:id]}-#{score[:score_type]}-#{score[:value_type]}" }
    end
  end
end
