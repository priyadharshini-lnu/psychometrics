# frozen_string_literal: true

module Devtools
  module CLI
    module Commands
      module I18n
        class TranslationImport < Base
          desc 'Import translations from a generated XLSX file into YAML files'
          option :file_path,
                 desc: 'Path to the XLSX file containing translations',
                 required: true

          def call(file_path:, **)
            @file_path = file_path

            display_header
            validate_input_file

            begin
              translations_by_locale = parse_xlsx_file
              import_translations(translations_by_locale)
              cli_log "\nTranslations imported successfully!"
            rescue StandardError => e
              cli_error "Error during import: #{e.message}"
              cli_error e.backtrace.join("\n")
            end
          end

          private

          attr_reader :file_path

          def display_header
            cli_log "\nI18n Translation Import"
            cli_log "=====================\n\n"
            cli_log "Source file: #{file_path}"
          end

          def validate_input_file
            unless File.exist?(file_path)
              cli_error "Error: File not found at path: #{file_path}"
              exit(1)
            end

            unless file_path.end_with?('.xlsx')
              cli_error 'Error: File must be an XLSX file'
              exit(1)
            end
          end

          def parse_xlsx_file
            cli_log 'Parsing XLSX file...'
            @available_locales = get_available_locales
            cli_log "Found locale folders: #{@available_locales.join(', ')}"

            require 'roo'
            workbook = Roo::Excelx.new(file_path)
            worksheet = workbook.sheet(0)

            parse_worksheet(worksheet)
          end

          def get_available_locales
            # Get all directories in config/locales that represent locales
            locales_path = File.join('config', 'locales')
            if Dir.exist?(locales_path)
              Dir.children(locales_path).select { |f| File.directory?(File.join(locales_path, f)) }
            else
              cli_log 'Warning: config/locales directory not found, falling back to default locales'
              ['en']
            end
          end

          def parse_worksheet(worksheet)
            headers = nil
            translations_by_locale = Hash.new { |h, k| h[k] = {} }

            (1..worksheet.last_row).each do |row_index|
              row_values = worksheet.row(row_index)

              if headers.nil?
                headers = row_values
                next
              end

              process_row(row_values, headers, translations_by_locale)
            end

            cli_log "Found translations for #{translations_by_locale.size} locales"
            translations_by_locale
          end

          def process_row(row_values, headers, translations_by_locale)
            return if row_values.empty? || row_values[0].nil? || row_values[1].nil?

            file_name = row_values[headers.index('File Name')]
            key = row_values[headers.index('Key')]

            return if file_name.nil? || key.nil?

            process_locales(row_values, headers, file_name, key, translations_by_locale)
          end

          def process_locales(row_values, headers, file_name, key, translations_by_locale)
            @available_locales.each do |locale_code|
              pattern = %r{ / #{locale_code}$} # Matches "Language Name / locale_code"

              headers.each_with_index do |header, index|
                next unless header&.match?(pattern)

                translation_value = row_values[index]

                next if translation_value.nil? || translation_value.to_s.strip.empty?

                store_translation(locale_code, file_name, key, translation_value, translations_by_locale)
                break
              end
            end
          end

          def store_translation(locale, file_name, key, value, translations_by_locale)
            translations_by_locale[locale] ||= {}
            translations_by_locale[locale][file_name] ||= {}
            translations_by_locale[locale][file_name][key] = value
          end

          def import_translations(translations_by_locale)
            translations_by_locale.each do |locale, files|
              cli_log "\nProcessing locale: #{locale}"
              process_locale_files(locale, files)
            end
          end

          def process_locale_files(locale, files)
            files.each do |file_name, keys|
              locale_file_path = File.join('config', 'locales', locale, file_name)
              cli_log "  Updating file: #{locale_file_path}"

              total_keys, updated_keys = update_yaml_file(locale_file_path, keys, locale)
              cli_log "  Total keys present: #{total_keys} | Keys updated: #{updated_keys}"
            end
          end

          def update_yaml_file(file_path, keys, locale)
            FileUtils.mkdir_p(File.dirname(file_path))
            yaml_data = load_yaml_file(file_path)
            updated_count = update_nested_hash(yaml_data, keys, locale)
            save_yaml_file(file_path, yaml_data)

            [keys.size, updated_count]
          end

          def load_yaml_file(file_path)
            File.exist?(file_path) ? YAML.load_file(file_path) || {} : {}
          end

          def save_yaml_file(file_path, yaml_data)
            File.write(file_path, yaml_data.to_yaml(line_width: -1))
          end

          def update_nested_hash(yaml_data, keys, locale)
            updated_count = 0

            keys.each do |key, value|
              if update_single_key(yaml_data, key, value, locale)
                updated_count += 1
              end
            end

            updated_count
          end

          def update_single_key(yaml_data, key, value, locale)
            key_parts = key.split('.')
            current = yaml_data
            current[locale] ||= {}
            current = current[locale]
            key_parts[0...-1].each do |part|
              current[part] ||= {}
              current = current[part]
            end

            last_key = key_parts.last
            changed = current[last_key] != value
            current[last_key] = value
            changed
          end
        end
      end
    end
  end
end
