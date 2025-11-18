# frozen_string_literal: true

module AdminJobs
  class ExportUserReportEvents < BaseExportCsv
    HEADERS = [
      'Event ID',
      'Project ID',
      'Project Name',
      'Campaign ID',
      'Campaign Name',
      'Subject First Name',
      'Subject Last Name',
      'Subject Email',
      'Initiator First Name',
      'Initiator Last Name',
      'Initiator Email',
      'Report ID',
      'Report Name',
      'Module ID',
      'Module Name',
      'Module Content',
      'Event Created At',
      'Event Type',
      'Content',
      'Previous Approval Status',
      'Current Approval Status'
    ].freeze

    def generate_details
      [[I18n.t('admin.user_report_events'), file_link]]
    end

    def headers
      HEADERS
    end

    def records_for_export
      return UserReportEvent.none unless entity

      scope = UserReportEvent.
              joins(
                user_report: %i[user report campaign],
                initiator: {}
              ).
              joins(
                'INNER JOIN clients projects ON projects.id = campaigns.project_id
                 INNER JOIN clients ON clients.id = projects.tte_id'
              ).
              joins(
                'LEFT JOIN reports_modules ON reports_modules.id = (user_report_events.details->>\'module\')::integer'
              ).
              select(
                'user_report_events.*',
                'campaigns.id AS campaign_id',
                'campaigns.name AS campaign_name',
                'projects.id AS project_id',
                'projects.name AS project_name',
                'users.first_name AS subject_first_name',
                'users.last_name AS subject_last_name',
                'users.email AS subject_email',
                'initiators_user_report_events.first_name AS initiator_first_name',
                'initiators_user_report_events.last_name AS initiator_last_name',
                'initiators_user_report_events.email AS initiator_email',
                'reports.id AS report_id',
                'reports.name AS report_name',
                'reports_modules.name AS module_name',
                'reports_modules.props ->> \'text\' AS module_content'
              )

      scope_by_parent_filters(scope).
        where(
          'user_report_events.created_at BETWEEN :start_date AND :end_date',
          start_date: start_date,
          end_date: end_date
        ).
        order(created_at: :desc)
    end

    def scope_by_parent_filters(scope)
      return scope.where(campaigns: { id: record.data['campaign_id'] }) if record.data['campaign_id']
      return scope.where(projects: { id: record.data['project_id'] }) if record.data['project_id']
      return scope.where(clients: { id: record.data['client_id'] }) if record.data['client_id']

      scope
    end

    def data_row(user_report_event)
      [
        user_report_event.id,
        user_report_event.project_id,
        user_report_event.project_name,
        user_report_event.campaign_id,
        user_report_event.campaign_name,
        user_report_event.subject_first_name,
        user_report_event.subject_last_name,
        user_report_event.subject_email,
        user_report_event.initiator_first_name,
        user_report_event.initiator_last_name,
        user_report_event.initiator_email,
        user_report_event.report_id,
        user_report_event.report_name,
        user_report_event.details['module'],
        user_report_event.module_name,
        module_content(user_report_event),
        I18n.l(user_report_event.created_at, format: :short),
        user_report_event.event_type,
        extract_content(user_report_event),
        user_report_event.details['from'],
        user_report_event.details['to']
      ]
    end

    def file_name
      "report-approval-logs (#{start_date.to_date} - #{end_date.to_date}).csv"
    end

    private

    def extract_content(event)
      details = event.details

      content = if event.event_type == 'comment_updated'
                  "Old: #{details['old_text']}\nNew: #{details['new_text']}"
                elsif event.event_type.start_with?('comment')
                  details['text']
                elsif event.event_type == 'removed_text'
                  original_module_content(event)
                else
                  details['content']
                end

      ActionController::Base.helpers.strip_tags(content)
    end

    def module_content(user_report_event)
      UserReports::FetchModuleContent.new(user_report_event).call
    end

    def original_module_content(user_report_event)
      UserReports::FetchModuleContent.new(user_report_event).original_module_content
    end

    def start_date
      Date.parse(record.data['start_date']).beginning_of_day
    end

    def end_date
      Date.parse(record.data['end_date']).end_of_day
    end

    def entity
      campaign || project || client
    end
  end
end
