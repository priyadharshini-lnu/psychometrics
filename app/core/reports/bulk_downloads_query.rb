# frozen_string_literal: true

module Reports
  class BulkDownloadsQuery < Rectify::Query
    def initialize(campaign_reports, params)
      @campaign_reports = campaign_reports
      @params = params
    end

    def query
      start_date = @params[:start_date].presence
      end_date = @params[:end_date].presence

      start_date_parsed = DateTime.parse(start_date) if start_date
      end_date_parsed = DateTime.parse(end_date) if end_date

      user_reports = UserReport.
                     joins(:report, :user, :pdf_file_attachment).
                     joins('INNER JOIN assessments_reports ON assessments_reports.report_id = reports.id').
                     joins('INNER JOIN assessments ON assessments.id = assessments_reports.assessment_id').
                     joins('INNER JOIN user_assessments ON
          user_assessments.assessment_id = assessments.id AND
          user_assessments.subject_id = user_reports.user_id AND
          user_assessments.campaign_id = user_reports.campaign_id').
                     where(report_id: @campaign_reports.pluck(:report_id),
                           campaign_id: @campaign_reports.first.campaign_id,
                           status: 'prepared').
                     group('user_reports.id')

      if start_date && end_date
        user_reports = user_reports.
                       having('MAX(user_assessments.completed_at) <= ? AND MIN(user_assessments.completed_at) >= ?',
                              end_date_parsed, start_date_parsed)
      elsif start_date
        user_reports = user_reports.
                       having('MIN(user_assessments.completed_at) >= ?', start_date_parsed)
      elsif end_date
        user_reports = user_reports.
                       having('MAX(user_assessments.completed_at) <= ?', end_date_parsed)
      end

      user_reports
    end
  end
end
