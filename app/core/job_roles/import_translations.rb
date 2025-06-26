# frozen_string_literal: true

module JobRoles
  class ImportTranslations < BaseCommand
    REQUIRED_FIELDS = %w[ID Locale Name Description].freeze

    attr_reader :file_url, :project_id

    def initialize(file_url, project_id = nil)
      @file_url = file_url.to_s
      @project_id = project_id
    end

    def call
      ActiveRecord::Base.transaction do
        process_csv_data(parsed_file)
      end

      broadcast :ok
    end

    private

    def process_csv_data(csv_data)
      csv_data.each do |row|
        process_row(row)
      end
    end

    def process_row(row)
      row_data = row.to_h.transform_values do |value|
        Utility::String.remove_csv_injection_marker(value.to_s.strip)
      end

      process_translation(row_data)
    end

    def process_translation(row_data)
      job_role = JobRole.find_by(id: row_data['ID'], project_id: project_id)

      locale = row_data['Locale'].to_sym
      Mobility.with_locale(locale) do
        job_role.update!(
          name: row_data['Name'],
          description: row_data['Description']
        )
      end
    end

    def parsed_file
      uri = URI.parse(file_url)

      CSV.parse(uri.open, headers: true, encoding: 'bom|utf-8')
    end
  end
end
