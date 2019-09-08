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
            score_type: 'RAW',
            scale_type: 'scale'
          },
          {
            sheet_name: 'percentileScales',
            score_type: 'percentile',
            scale_type: 'scale'
          },
          {
            sheet_name: 'percentileSubScales',
            score_type: 'percentile',
            scale_type: 'subscale'
          }
        ]
      end

      def add_score(package, score)
        package.workbook.add_worksheet(name: score[:sheet_name]) do |sheet|
          header_style = package.workbook.styles.add_style(b: true, sz: 14)
          headers = assigns_reports_headers(score[:score_type], score[:scale_type])
          sheet.add_row(default_headers + headers, style: header_style)

          assigns_reports.each do |assigns_report|
            content = assigns_report_content(assigns_report, score[:score_type], score[:scale_type])
            sheet.add_row(default_content(assigns_report) + content)
          end
        end
      end

      def assigns_reports_headers(score_type, scale_type)
        headers = assigns_reports_with_score.map do |assigns_report|
          assigns_report_headers(assigns_report, score_type, scale_type)
        end
        headers.find(&:any?) || []
      end

      def assigns_report_headers(assigns_report, score_type, scale_type)
        assigns_report_data(assigns_report, score_type, scale_type, 'type')
      end

      def assigns_report_content(assigns_report, score_type, scale_type)
        assigns_report_data(assigns_report, score_type, scale_type, '__content__')
      end

      def assigns_report_data(assigns_report, score_type, scale_type, data_type)
        score = assigns_report&.hogan_score&.dig('participant', 'assessment', 'score')&.find do |i|
          i['type'] == score_type
        end
        return [] if score.nil?

        data =
          if scale_type == 'scale'
            score.dig('scales', 'scale')
          elsif scale_type == 'subscale'
            score.dig('subscales', 'subscale')
          end

        return [] if data.nil?

        data.map { |i| i[data_type] }
      end

      def default_content(assigns_report)
        [
          assigns_report.assign.encode_id,
          assigns_report.full_name,
          assigns_report.user_email,
          assigns_report.participant_id,
          assigns_report.started_at&.strftime('%D %r'),
          assigns_report.completed_at&.strftime('%D %r')
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
