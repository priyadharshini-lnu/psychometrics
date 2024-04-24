# frozen_string_literal: true

module AdminJobs
  module SuperAdmin
    class DatasheetExport < BaseExportCsv
      def generate_details
        [['File', file_link]]
      end

      private

      def headers
        @headers ||= query_obj.all_column_names
      end

      def data_row(record)
        headers.map do |column_name|
          record[column_name]
        end
      end

      def write_csv
        job_record.update(total_tasks: record_count)
        CSV.open(file_path, 'wb') do |csv|
          limit = 1000
          offset = 0
          number_of_queries = (record_count / limit.to_f).ceil
          number_of_queries.times do |i|
            records = records_for_export(limit, offset)
            csv << records.first.keys if i.zero?

            records.each do |record|
              csv << record.values
            end
            offset += limit
            job_record.update!(completed_tasks: offset)
            csv.flush
          end

          job_record.complete!
        end
      end

      def records_for_export(limit = 1000, offset = 0)
        DatasheetRowQuery.new(
          campaign_ids: campaign_ids,
          project_ids: record.data['project_ids'],
          limit: limit,
          offset: offset
        ).query.to_a
      end

      def record_count
        @record_count ||= query_obj.total_count
      end

      def query_obj
        @query_obj ||= DatasheetRowQuery.new(campaign_ids: campaign_ids, project_ids: record.data['project_ids'])
      end

      def file_name
        "datasheet-export-#{record.id}.csv"
      end
    end
  end
end
