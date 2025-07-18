# frozen_string_literal: true

module Reports
  class BulkDownloadsQuery < Rectify::Query
    attr_reader :campaign_reports, :params, :start_date, :end_date, :include_inactive_users,
                :selected_reports

    def initialize(campaign_reports, params)
      @campaign_reports = campaign_reports
      @params = params
      @start_date = params[:start_date].presence
      @end_date = params[:end_date].presence
      @include_inactive_users = params[:include_inactive_users] || false
      @selected_reports = params[:selected_reports] || {}
    end

    def query
      return UserReport.none if @campaign_reports.blank?

      start_date_parsed = DateTime.parse(start_date) if start_date
      end_date_parsed = DateTime.parse(end_date) if end_date

      user_reports = UserReport.with_pdf_attachments.
                     joins(:report, :user).
                     joins(
                       'INNER JOIN campaign_reports ON ' \
                       'campaign_reports.report_id = user_reports.report_id ' \
                       'AND campaign_reports.campaign_id = user_reports.campaign_id'
                     ).
                     joins('INNER JOIN assessments_reports ON assessments_reports.report_id = reports.id').
                     joins('INNER JOIN assessments ON assessments.id = assessments_reports.assessment_id').
                     joins('INNER JOIN user_assessments ON
          user_assessments.assessment_id = assessments.id AND
          user_assessments.subject_id = user_reports.user_id AND
          user_assessments.campaign_id = user_reports.campaign_id')

      unless include_inactive_users
        user_reports = user_reports.
                       joins('INNER JOIN campaign_users ON
            campaign_users.campaign_id = user_reports.campaign_id AND
            campaign_users.user_id = user_reports.user_id').
                       where('campaign_users.active': true)
      end

      user_reports = user_reports.
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

      filter_by_report_locales(user_reports)
    end

    private

    def filter_by_report_locales(user_reports)
      return user_reports if selected_reports.blank?

      query_parts = selected_reports.to_h.map do |report_id, locales|
        next if locales.blank?

        user_reports.where(
          'campaign_reports.report_id = ? AND user_report_pdfs.locale IN (?)',
          report_id.to_i,
          locales
        )
      end

      return user_reports if query_parts.blank?

      query_parts.reduce { |combined, query| combined.or(query) }
    end
  end
end
