# frozen_string_literal: true

module Administration
  class ImportJobRoleTranslations < BaseCommand
    REQUIRED_FIELDS = %w[ID].freeze

    def initialize(file, project_id)
      @file = file
      @project_id = project_id
    end

    # rubocop:disable Metrics/CyclomaticComplexity
    # rubocop:disable Metrics/PerceivedComplexity
    def call
      begin
        csv_data = CsvFileParser.call!(@file, headers: true)
      rescue Errors::DownloadFailedError => e
        raise Errors::ImportError, e.message
      end

      ActiveRecord::Base.transaction do
        process_csv_data(csv_data)
      end

      true
    end

    private

    def process_csv_data(csv_data)
      validate_headers(csv_data.headers)

      header_locale_map = build_header_locale_map(csv_data.headers)
      grouped_rows = group_rows_by_job_role_and_field(csv_data)

      grouped_rows.each do |job_role_id, field_data|
        process_job_role_translations(job_role_id, field_data, header_locale_map)
      end
    end

    def validate_headers(headers)
      missing_fields = REQUIRED_FIELDS - headers
      if missing_fields.any?
        raise Errors::ImportError,
              I18n.t(
                'administration.job_roles.translations.import.errors.missing_columns',
                columns: missing_fields.join(', ')
              )
      end
    end

    def build_header_locale_map(headers)
      headers.each_with_object({}) do |header, map|
        next if header == 'ID'

        # Format is expected to be like "English / en" where "en" is the locale code
        locale = header.split(' / ').last
        map[header] = locale if locale
      end
    end

    def group_rows_by_job_role_and_field(csv_data)
      grouped_data = {}

      csv_data.each do |row|
        row_data = row.to_h.transform_values do |value|
          Utility::String.remove_csv_injection_marker(value.to_s.strip)
        end

        id_field = row_data['ID']
        next unless id_field

        # Format is expected to be like "123#Name" or "123#Description"
        parts = id_field.split('#')
        next unless parts.size == 2

        job_role_id = parts[0]
        field_type = parts[1]

        grouped_data[job_role_id] ||= {}
        grouped_data[job_role_id][field_type] = row_data
      end

      grouped_data
    end

    def process_job_role_translations(job_role_id, field_data, header_locale_map)
      job_role = JobRole.find_by(id: job_role_id, project_id: @project_id)
      unless job_role
        raise Errors::ImportError, I18n.t('administration.job_roles.translations.import.errors.job_role_not_found',
                                          id: job_role_id)
      end

      header_locale_map.each do |header, locale|
        next if locale.blank?

        name = field_data['Name']&.[](header)
        description = field_data['Description']&.[](header)

        next if name.blank? && description.blank?

        Mobility.with_locale(locale) do
          job_role.update!(
            name: name.presence || job_role.name,
            description: description.presence || job_role.description
          )
        rescue ActiveRecord::RecordInvalid => e
          raise Errors::ImportError,
                I18n.t(
                  'administration.job_roles.translations.import.errors.save_failed',
                  id: job_role_id,
                  message: e.message
                )
        end
      end
    end
  end
end
# rubocop:enable Metrics/CyclomaticComplexity
# rubocop:enable Metrics/PerceivedComplexity
