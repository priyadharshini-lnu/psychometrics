# frozen_string_literal: true

require 'csv-safe'

module Administration
  class ImportProficiencyLevelTranslations < BaseCommand
    REQUIRED_FIELDS = %w[ID].freeze
    ID_PATTERN = /^(\d+)#LevelDefinition\.\$\[(\d+)\]\.(.+)$/ # e.g., "10000003#LevelDefinition.$[0].name"
    NUMERIC_FIELDS = %w[level_number number total_levels].freeze

    def initialize(file, project_id = nil)
      @file = file
      @project_id = project_id
      @errors = []
    end

    def call
      begin
        csv_data = CsvFileParser.call!(@file)
        return @errors if @errors.any?

        ActiveRecord::Base.transaction do
          process_csv_data(csv_data)
          raise ActiveRecord::Rollback if @errors.any?
        end
      rescue Errors::DownloadFailedError => e
        @errors << e.message
      rescue CSV::MalformedCSVError => e
        @errors << I18n.t('administration.proficiency_levels.import.errors.invalid_csv_format', message: e.message)
      end

      @errors.empty? ? true : @errors
    end

    private

    def process_csv_data(csv_data)
      headers = csv_data.shift
      validate_headers(headers)
      return if @errors.any?

      csv_data.each.with_index(2) do |row, _line_number|
        row_data = headers.zip(row).to_h
        row_data = clean_row_data(row_data)
        import_row_translations(row_data)
      end
    end

    def validate_headers(headers)
      unless headers.include?('ID')
        @errors << I18n.t('administration.proficiency_levels.translations.import.errors.missing_columns',
                          fields: 'ID')
      end
    end

    def clean_row_data(row_data)
      row_data.transform_values { |val| Utility::String.remove_csv_injection_marker(val.to_s.strip) }
    end

    def import_row_translations(row_data)
      level_info = parse_level_info(row_data['ID'])
      return unless level_info

      level = find_proficiency_level(level_info[:id])
      return unless level

      update_level_translations(level, level_info, row_data)
    rescue ActiveRecord::RecordInvalid => e
      @errors << I18n.t('administration.proficiency_levels.translations.import.errors.save_failed',
                        message: e.message)
    end

    def parse_level_info(id_path)
      return nil if id_path.blank?

      if (match = id_path.match(ID_PATTERN))
        {
          id: match[1], # level ID
          index: match[2].to_i, # array index
          field: match[3] # field name (e.g., "name")
        }
      end
    end

    def find_proficiency_level(level_id)
      level = ProficiencyLevel.find_by(id: level_id, project_id: [@project_id, nil])
      unless level
        @errors << I18n.t('administration.proficiency_levels.translations.import.errors.level_not_found',
                          id: level_id)
        return nil
      end
      level
    end

    def update_level_translations(level, level_info, row_data)
      row_data.each do |header, value|
        next if header == 'ID' || value.blank?

        locale = extract_locale_from_header(header)
        next unless locale

        update_translation(level, locale, level_info, value)
      end
    end

    def extract_locale_from_header(header)
      locale_code = header.split('/').last&.strip
      return nil unless locale_code && I18n.available_locales.include?(locale_code.to_sym)

      locale_code.to_sym
    end

    def update_translation(level, locale, level_info, value)
      Mobility.with_locale(locale) do
        definition = level.level_definition || []

        definition[level_info[:index]] ||= {}

        value = convert_value_type(level_info[:field], value)
        definition[level_info[:index]][level_info[:field]] = value

        level.update!(level_definition: definition)
      end
    end

    def convert_value_type(field, value)
      NUMERIC_FIELDS.include?(field) ? value.to_i : value
    end
  end
end
