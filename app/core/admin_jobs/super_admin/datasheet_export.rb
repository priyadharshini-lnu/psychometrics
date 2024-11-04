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
          campaign_ids: filtered_campaign_ids,
          project_ids: filtered_project_ids,
          limit: limit,
          offset: offset
        ).query.to_a
      end

      def record_count
        @record_count ||= query_obj.total_count
      end

      def query_obj
        @query_obj ||= DatasheetRowQuery.new(
          campaign_ids: filtered_campaign_ids,
          project_ids: filtered_project_ids
        )
      end

      def file_name
        "datasheet-export-#{record.id}.csv"
      end

      def filtered_campaign_ids
        return [] unless campaign_ids

        @filtered_campaign_ids ||=
          if record.data['project_ids'].present?
            Campaign.
              where(id: campaign_ids, project_id: filtered_project_ids).
              pluck(:id)
          else
            Campaign.
              where(id: campaign_ids).
              joins('LEFT JOIN clients ON campaigns.project_id = clients.id').
              joins(join_clauses).where(privacy_conditions).pluck(:id)
          end
      end

      def filtered_project_ids
        return [] unless record.data['project_ids']

        @filtered_project_ids ||= Project.where(id: record.data['project_ids']).
                                  joins(join_clauses).
                                  where(privacy_conditions).pluck(:id)
      end

      def join_clauses
        <<-SQL.squish
          LEFT JOIN clients parent_clients ON clients.ancestry = parent_clients.id::text
          LEFT JOIN privacy_settings ON privacy_settings.project_id = clients.id
          LEFT JOIN client_privacy_settings ON client_privacy_settings.client_id = parent_clients.id
        SQL
      end

      def privacy_conditions
        'privacy_settings.disable_data_processing = false AND client_privacy_settings.disable_data_processing = false'
      end
    end
  end
end
