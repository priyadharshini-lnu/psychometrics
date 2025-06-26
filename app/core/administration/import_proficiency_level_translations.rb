# frozen_string_literal: true

require 'csv-safe'

module Administration
  class ImportProficiencyLevelTranslations < BaseCommand
    REQUIRED_FIELDS = %w[ID].freeze
    ID_PATTERN = /^(\d+)#LevelDefinition\.\$\[(\d+)\]\.(.+)$/ # e.g., "10000003#LevelDefinition.$[1].name"
    NUMERIC_FIELDS = %w[level_number number total_levels].freeze

    def initialize(file, project_id = nil)
      @file = file
      @project_id = project_id
      @errors = []
      @collected_translations = {}
    end

    def call
      begin
        csv_data = CsvFileParser.call!(@file)
        return @errors if @errors.any?

        ActiveRecord::Base.transaction do
          process_csv_data(csv_data)
          save_collected_translations if @errors.empty?
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
        collect_row_translations(row_data)
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

    def collect_row_translations(row_data)
      level_info = parse_level_info(row_data['ID'])
      return unless level_info

      @collected_translations[level_info[:id]] ||= {
        level_definitions: {},
        locales: {}
      }

      row_data.each do |header, value|
        next if header == 'ID' || value.blank?

        locale = extract_locale_from_header(header)
        next unless locale

        @collected_translations[level_info[:id]][:locales][locale] ||= {}

        level_num = level_info[:level]
        @collected_translations[level_info[:id]][:locales][locale][level_num] ||= {
          'level' => level_num
        }

        if %w[name description].include?(level_info[:field])
          @collected_translations[level_info[:id]][:locales][locale][level_num][level_info[:field]] = value
        end
      end
    end

    def save_collected_translations
      @collected_translations.each do |level_id, data|
        level = find_proficiency_level(level_id)
        next unless level

        data[:locales].each do |locale, translations|
          save_locale_translations(level, locale, translations)
        end
      end
    rescue ActiveRecord::RecordInvalid => e
      @errors << I18n.t('administration.proficiency_levels.translations.import.errors.save_failed',
                        message: e.message)
    end

    def save_locale_translations(level, locale, translations)
      Mobility.with_locale(locale) do
        definition = []
        translations.each_value do |level_data|
          definition << level_data
        end

        definition.sort_by! { |d| d['level'].to_i }
        level.update!(level_definition: definition)
      end
    rescue ActiveRecord::RecordInvalid => e
      @errors << I18n.t('administration.proficiency_levels.translations.import.errors.save_failed',
                        message: e.message)
    end

    def parse_level_info(id_path)
      return nil if id_path.blank?

      if (match = id_path.match(ID_PATTERN))
        {
          id: match[1], # level ID
          level: match[2].to_i, # level number from path
          field: match[3] # field name (e.g., "name")
        }
      end
    end

    def find_proficiency_level(level_id)
      level = ProficiencyLevel.find_by(id: level_id, project_id: [@project_id, nil])
      unless level
        @errors << I18n.t('administration.proficiency_levels.translations.import.errors.level_not_found',
                          level_id: level_id)
        return nil
      end
      level
    end

    def extract_locale_from_header(header)
      return nil if header == 'ID'

      locale_code = header.split('/').last&.strip
      return nil unless locale_code && I18n.available_locales.include?(locale_code.to_sym)

      locale_code.to_sym
    end
  end
end
