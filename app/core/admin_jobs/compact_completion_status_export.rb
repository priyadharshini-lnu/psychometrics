# frozen_string_literal: true

module AdminJobs
  class CompactCompletionStatusExport < BaseExportCsv
    def generate_details
      [[I18n.t('common.model.completion_statuses'), file_link]]
    end

    private

    def locals
      {
        completion_statuses: completion_statuses,
        headers: headers
      }
    end

    def completion_statuses
      Campaigns::CompactCompletionStatusQuery.new(record.data['campaign_id']).query.to_a
    end

    def headers
      completion_statuses[0]&.keys || Campaigns::CompactCompletionStatusQuery::DEFAULT_COLUMN_NAMES
    end

    def csv_template
      'administration/campaigns/users/export_compact_completion_status.csv.am'
    end

    def file_name
      'compact-completion-statuses.csv'
    end
  end
end
