# frozen_string_literal: true

module AdminJobs
  class CompactCompletionStatusExport < BaseExportCsv
    def generate_details
      [[I18n.t('common.model.completion_statuses'), file_link]]
    end

    private

    def headers
      records_for_export[0]&.keys || Campaigns::CompactCompletionStatusQuery::DEFAULT_COLUMN_NAMES
    end

    def records_for_export
      Campaigns::CompactCompletionStatusQuery.new(record.data['campaign_id']).query.to_a
    end

    def data_row(record)
      record.values
    end

    def file_name
      'compact-completion-statuses.csv'
    end
  end
end
