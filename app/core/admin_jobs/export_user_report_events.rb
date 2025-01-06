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
      'Initiator First Name',
      'Initiator Last Name',
      'Initiator Email',
      'Report ID',
      'Module ID',
      'Module Name',
      'Event Created At',
      'Event Type',
      'Content',
      'Report Status Changes'
    ].freeze

    def generate_details
      [[I18n.t('administration.navigation.user_report_events'), file_link]]
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
                'initiators_user_report_events.first_name AS initiator_first_name',
                'initiators_user_report_events.last_name AS initiator_last_name',
                'initiators_user_report_events.email AS initiator_email',
                'reports.id AS report_id',
                'reports_modules.name AS module_name'
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
        user_report_event.initiator_first_name,
        user_report_event.initiator_last_name,
        user_report_event.initiator_email,
        user_report_event.report_id,
        user_report_event.details['module'],
        user_report_event.module_name,
        I18n.l(user_report_event.created_at, format: :short),
        user_report_event.event_type,
        user_report_event.details['content'],
        status_changes(user_report_event)
      ]
    end

    def file_name
      "user-report-events-#{entity.class.name.underscore}-#{entity.id}.csv"
    end

    private

    def status_changes(event)
      event.event_type == 'status_changed' ? event.details['from'] : nil
    end

    def start_date
      record.data['start_date']
    end

    def end_date
      record.data['end_date']
    end

    def entity
      campaign || project || client
    end
  end
end
