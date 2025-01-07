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
          limit = 100
          offset = 0
          number_of_queries = (record_count / limit.to_f).ceil
          number_of_queries.times do |i|
            records = records_for_export(limit, offset)
            csv << records.first.keys if i.zero?

            records.each do |record|
              csv << record.map { |k, v| parse_value(k, v) }
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

      def parse_value(field, value)
        return value unless datasheets_columns_types[field]
        return value if !value || value.is_a?(Numeric)
        return value.to_f if datasheets_columns_types[field] == 'number'

        value
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

      def datasheets_columns_types
        return @datasheets_columns_types if defined?(@datasheets_columns_types)

        @datasheets_columns_types = {}
        datasheets_types = datasheets.map(&:sheet_columns).each_with_object({}) do |columns, types|
          columns.each do |column|
            types[column.name] ||= []
            types[column.name] << column.column_type == 'number' ? 'number' : 'string'
          end
        end
        datasheets_types.each do |column_name, column_types|
          @datasheets_columns_types[column_name] = column_types.all?('number') ? 'number' : 'string'
        end
        @datasheets_columns_types
      end

      def datasheet_ids
        datasheets.pluck(:id)
      end

      def datasheets
        project_ids = filtered_project_ids
        campaign_ids = filtered_campaign_ids
        sheet = Datasheet.none
        if project_ids.present? && campaign_ids.present?
          sheet = Datasheet.where(project_id: project_ids).or(Datasheet.where(campaign_id: campaign_ids))
        elsif project_ids.present?
          sheet = Datasheet.where(project_id: project_ids)
        elsif campaign_ids.present?
          sheet = Datasheet.where(campaign_id: campaign_ids)
        end
        sheet
      end
    end
  end
end
