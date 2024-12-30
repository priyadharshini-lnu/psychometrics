# frozen_string_literal: true

require 'csv-safe'

module AdminJobs
  class CompactCompletionStatusExport < BaseExportCsv
    def generate_details
      [[I18n.t('common.model.completion_statuses'), file_link]]
    end

    private

    def headers
      records_for_export[0]&.keys || Campaigns::CompactCompletionStatusQuery::DEFAULT_COLUMN_NAMES
    end

    def write_csv
      job_record.update(total_tasks: record_count)

      CSVSafe.open(file_path, 'wb') do |csv|
        write_csv_headers(csv)

        limit = 1000
        offset = 0

        loop do
          records = records_for_export(limit, offset)
          break if records.empty?

          records.each do |record|
            rows = data_row(record).first.is_a?(Array) ? data_row(record) : [data_row(record)]
            rows.each { |row| csv << row }
          end

          offset += limit

          completed_record_count = offset
          if (completed_record_count % flush_threshold).zero?
            csv.flush
            job_record.update!(completed_tasks: completed_record_count)
          end
        end

        job_record.complete!
      end
    end

    def records_for_export(limit = 1000, offset = 0)
      Campaigns::CompactCompletionStatusQuery.new(
        campaign.id,
        limit: limit,
        offset: offset
      ).query.to_a
    end

    def record_count
      @record_count ||= Campaigns::CompactCompletionStatusQuery.new(
        campaign.id
      ).query.count
    end

    def data_row(record)
      record.values
    end

    def file_name
      'compact-completion-statuses.csv'
    end
  end
end
