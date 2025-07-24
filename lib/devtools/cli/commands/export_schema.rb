# frozen_string_literal: true

require 'fast_excel'
require 'time'

module Devtools
  module CLI
    module Commands
      class ExportSchema < Base
        desc <<-DESC
          Export data from all tables and views in a specified schema as Excel with each table/view in a separate sheet.
        DESC
        option :schema_name, required: true, desc: 'Name of the schema to export data from'
        option :limit_rows, type: :integer, default: 10, desc: 'Number of rows to export from each table/view'

        def call(schema_name:, limit_rows: 10, **)
          cli_log "\nExporting Schema: #{schema_name} \n\n"

          # Verify schema exists
          schema_exists_query = ActiveRecord::Base.sanitize_sql_array(
            ['SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = ?)', schema_name]
          )
          schema_exists = ActiveRecord::Base.connection.execute(schema_exists_query).first['exists']

          unless schema_exists
            cli_log "Error: Schema '#{schema_name}' does not exist."
            return
          end

          # Get all tables and views in the schema
          tables_query = ActiveRecord::Base.sanitize_sql_array(
            ['SELECT table_name, table_type FROM information_schema.tables WHERE table_schema = ?', schema_name]
          )
          tables_and_views = ActiveRecord::Base.connection.execute(tables_query)

          if tables_and_views.count.zero?
            cli_log "No tables or views found in schema '#{schema_name}'."
            return
          end

          # Create a new Excel workbook
          current_datetime = Time.current.strftime('%Y-%m-%d_%H-%M')
          file_name = "#{schema_name}-schema-export-#{current_datetime}.xlsx"
          file_path = Rails.root.join('tmp', file_name)

          # Generate the Excel file
          generate_excel(tables_and_views, schema_name, file_path, limit_rows)

          cli_log "Excel file generated successfully at: #{file_path}"
        end

        private

        def generate_excel(tables_and_views, schema_name, file_path, limit_rows)
          workbook = FastExcel.open(file_path, constant_memory: true)

          # Create a bold format for headers
          bold_format = workbook.bold_format

          tables_and_views.each do |table_info| # rubocop:disable Metrics/BlockLength
            table_name = table_info['table_name']
            table_type = table_info['table_type']

            cli_log "Processing #{table_type.downcase} '#{table_name}'..."

            # Query the data from the table/view with specified row limit
            begin
              cli_log "  Fetching up to #{limit_rows} rows..."

              # Safely quote the schema and table names using connection.quote_table_name
              quoted_schema_table = ActiveRecord::Base.connection.quote_table_name("#{schema_name}.#{table_name}")

              # Use sanitize_sql_array for the limit parameter
              query = ActiveRecord::Base.sanitize_sql_array(
                ["SELECT * FROM #{quoted_schema_table} LIMIT ?", limit_rows]
              )

              rows = ActiveRecord::Base.connection.execute(query)

              next if rows.count.zero?

              worksheet_name = truncate_worksheet_name(table_name)
              worksheet = workbook.add_worksheet(worksheet_name)

              headers = rows.fields
              worksheet.append_row(headers, bold_format)

              rows.each do |row|
                row_values = headers.map do |header|
                  value = row[header]
                  value.nil? ? '' : value
                end
                worksheet.append_row(row_values)
              end

              headers.each_with_index do |header, index|
                width = [header.to_s.length * 1.2, 10].max
                worksheet.set_column_width(index, width)
              end

              worksheet.autofilter(0, 0, rows.count, headers.length - 1)
            rescue StandardError => e
              cli_log "Error processing '#{table_name}': #{e.message}"
            end
          end

          workbook.close
          cli_log "Excel file saved to #{file_path}"
        end

        # Excel has a 31 character limit for worksheet names
        def truncate_worksheet_name(name)
          name.length > 31 ? name[0..30] : name
        end
      end
    end
  end
end
