# frozen_string_literal: true

module Exports
  module Assessments
    class HoganResultsExport
      def initialize(client_id, assessment_id, report_id)
        @client_id = client_id
        @assessment_id = assessment_id
        @report_id = report_id
      end

      def to_xlsx
        Axlsx::Package.new do |package|
          scores.each do |score|
            add_score(package, score)
          end
        end
      end

      private

      def scores
        [
          {
            sheet_name: 'Raw',
            score_type: 'rawScores',
            scale_type: 'scaleScores',
            value_field: 'scaleScore',
            factor_field: 'scaleName'
          },
          {
            sheet_name: 'percentileScales',
            score_type: 'percentileScores',
            scale_type: 'scaleScores',
            value_field: 'scaleScore',
            factor_field: 'scaleName'
          },
          {
            sheet_name: 'percentileSubScales',
            score_type: 'percentileScores',
            scale_type: 'subscaleScores',
            value_field: 'subscaleScore',
            factor_field: 'subscaleName'
          }
        ]
      end

      def add_score(package, score)
        package.workbook.add_worksheet(name: score[:sheet_name]) do |sheet|
          header_style = package.workbook.styles.add_style(b: true, sz: 14)
          headers = build_headers(score)
          sheet.add_row(default_headers + headers, style: header_style)

          assigns_reports.each do |assigns_report|
            content = build_data(assigns_report, score)
            sheet.add_row(default_content(assigns_report) + content)
          end
        end
      end

      def build_headers(score)
        sample = assigns_reports_with_score.sample
        return [] unless sample

        (sample.hogan_score&.dig(score[:score_type], score[:scale_type]) || []).map do |item|
          item[score[:factor_field]]
        end
      end

      def build_data(res, score)
        (res.hogan_score&.dig(score[:score_type], score[:scale_type]) || []).map do |item|
          item[score[:value_field]]
        end
      end

      def default_content(assigns_report)
        [
          assigns_report.assign.encode_id,
          assigns_report.full_name,
          assigns_report.user_email,
          assigns_report.participant_id,
          assigns_report.started_at.to_s,
          assigns_report.completed_at.to_s
        ]
      end

      def assigns_reports
        @assigns_reports ||= Queries::AssignsReports::ByClientAssessmentAndReportId.
                             call(@client_id, @assessment_id, @report_id).
                             selecting do
          [assign.id.as('assign_id'),
           assign.membership.user.first_name.op('||', quoted(' ')).op('||', assign.membership.user.last_name).
             as('full_name'),
           assign.membership.user.email.as('user_email'),
           assign.membership.project_membership.hogan_credential.participant_id,
           assign.started_at,
           assign.completed_at,
           hogan_score]
        end
      end

      def default_headers
        ['result ID', 'First and Last name', 'User email', 'participant ID', 'started at', 'completed at']
      end

      def assigns_reports_with_score
        @assigns_reports_with_score ||= assigns_reports.where.has { hogan_score != {} }
      end
    end
  end
end
