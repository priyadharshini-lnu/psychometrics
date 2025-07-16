# frozen_string_literal: true

require 'json'
require 'yaml'

module Devtools
  module CLI
    module Commands
      module I18n
        class ImportFromJson < Base
          desc <<~DESC
            Import translations from a JSON file or folder containing JSON files into YAML files

            Usage:
              # Import single file
              ./bin/devtools I18n import_from_json --file-path=path/to/ar.json --locale=ar

              # Import entire folder (locale derived from filename)
              ./bin/devtools I18n import_from_json --folder-path=path/to/translations_folder

              # Show detailed output with individual key additions
              ./bin/devtools I18n import_from_json --folder-path=path/to/translations_folder --verbose
          DESC
          option :file_path,
                 desc: 'Path to the JSON file containing translations',
                 alias: :fp
          option :folder_path,
                 desc: 'Path to the folder containing JSON files (locale will be derived from filename)',
                 alias: :dp
          option :locale,
                 desc: 'Target locale (e.g., bg, fr, de) - required when using file_path',
                 alias: :l
          option :verbose,
                 desc: 'Show detailed output including individual key additions',
                 type: :boolean,
                 default: false,
                 alias: :v

          def call(file_path: nil, folder_path: nil, locale: nil, verbose: false, **)
            @verbose = verbose
            validate_options(file_path, folder_path, locale)

            if folder_path
              process_folder(folder_path)
            else
              process_single_file(file_path, locale)
            end
          end

          private

          attr_reader :file_path, :locale, :skipped_keys, :verbose

          def validate_options(file_path, folder_path, locale)
            if file_path && folder_path
              cli_error 'Error: Please provide either --file-path or --folder-path, not both'
            end

            unless file_path || folder_path
              cli_error 'Error: Please provide either --file-path or --folder-path'
            end

            if file_path && !locale
              cli_error 'Error: --locale is required when using --file-path'
            end

            if folder_path && locale
              # rubocop:disable Layout/LineLength
              cli_error 'Error: --locale should not be provided when using --folder-path (locale will be derived from filenames)'
              # rubocop:enable Layout/LineLength
            end
          end

          def process_folder(folder_path)
            unless Dir.exist?(folder_path)
              cli_error "Error: Folder not found at path: #{folder_path}"
            end

            json_files = Dir.glob(File.join(folder_path, '*.json'))

            if json_files.empty?
              cli_error "Error: No JSON files found in folder: #{folder_path}"
            end

            cli_log "\nI18n Folder JSON Translation Import"
            cli_log "====================================\n"
            cli_log "Source folder: #{folder_path}"
            cli_log "Found #{json_files.size} JSON file(s)\n"

            json_files.each do |json_file|
              locale = derive_locale_from_filename(json_file)

              if locale
                cli_log "Processing #{File.basename(json_file)} (locale: #{locale})"
                process_single_file(json_file, locale, show_header: false)
                display_skipped_keys_if_any
                cli_log ''
              else
                cli_log "Skipping #{File.basename(json_file)}: Unable to derive locale from filename"
              end
            end

            cli_log '=' * 50
            cli_log 'Folder import completed!'
          end

          def derive_locale_from_filename(file_path)
            filename = File.basename(file_path, '.json')

            # Handle common locale formats:
            # - ar.json -> ar
            # - zh-Hans.json -> zh
            # - zh-Hant.json -> zh-Hant
            # - en-US.json -> en-US
            # - sr-Cyrl.json -> sr-Cyrl

            # Check if the filename exactly matches a known locale directory
            locale_directories = Dir.glob(Rails.root.join('config/locales/*').to_s).map do |dir|
              File.basename(dir)
            end

            if locale_directories.include?(filename)
              return filename
            end

            # Try to match base locale (e.g., 'zh' from 'zh-Hans')
            base_locale = filename.split('-').first
            if locale_directories.include?(base_locale)
              return base_locale
            end

            # If no match found, return nil
            nil
          end

          def process_single_file(file_path, locale, show_header: true)
            @file_path = file_path
            @locale = locale.to_s
            @skipped_keys = []

            display_header if show_header
            validate_input

            begin
              json_data = parse_json_file
              import_translations(json_data)
              display_results if show_header
            rescue StandardError => e
              cli_error "Error during import: #{e.message}"
            end
          end

          def display_header
            cli_log "\nI18n JSON Translation Import"
            cli_log "==============================\n"
            cli_log "Source file: #{file_path}"
            cli_log "Target locale: #{locale}\n"
          end

          def validate_input
            unless File.exist?(file_path)
              cli_error "Error: File not found at path: #{file_path}"
            end

            unless file_path.end_with?('.json')
              cli_error 'Error: File must be a JSON file'
            end

            unless locale_directory_exists?
              cli_error "Error: Locale directory not found: #{locale_directory_path}"
            end
          end

          def locale_directory_exists?
            Dir.exist?(locale_directory_path)
          end

          def locale_directory_path
            @locale_directory_path = Rails.root.join('config', 'locales', locale).to_s
          end

          def parse_json_file
            JSON.parse(File.read(file_path))
          rescue JSON::ParserError => e
            cli_error "Error parsing JSON file: #{e.message}"
          end

          def import_translations(json_data)
            cli_log "Processing translations...\n"

            # Group translations by target file based on topmost key
            grouped_translations = group_translations_by_file(json_data)

            grouped_translations.each do |file_name, translations|
              yaml_file_path = File.join(locale_directory_path, file_name)

              if File.exist?(yaml_file_path)
                process_yaml_file(yaml_file_path, translations)
              else
                cli_log "Warning: Target file #{file_name} not found, skipping these translations"
                skip_all_translations(translations)
              end
            end
          end

          def group_translations_by_file(json_data)
            grouped = {}

            json_data.each do |top_key, value|
              target_file = if top_key == 'administration'
                              'administration.yml'
                            else
                              'others.yml'
                            end

              grouped[target_file] ||= {}
              grouped[target_file][top_key] = value
            end

            grouped
          end

          def skip_all_translations(translations, current_path = [])
            translations.each do |key, value|
              new_path = current_path + [key]

              if value.is_a?(Hash)
                skip_all_translations(value, new_path)
              else
                skipped_keys << {
                  path: new_path.join('.'),
                  value: value,
                  reason: 'Target YAML file not found'
                }
              end
            end
          end

          def process_yaml_file(yaml_file, translations_for_file)
            cli_log "Processing file: #{File.basename(yaml_file)}"

            yaml_content = YAML.load_file(yaml_file) || {}
            locale_content = yaml_content[locale] || {}

            original_size = count_leaf_nodes(locale_content)
            updated_content = merge_translations(locale_content, translations_for_file)
            new_size = count_leaf_nodes(updated_content)

            if new_size > original_size
              yaml_content[locale] = updated_content
              # Configure YAML output to preserve string formatting and avoid unwanted line breaks
              yaml_output = yaml_content.to_yaml(line_width: -1)
              File.write(yaml_file, yaml_output)
              cli_log "  ✓ Updated with #{new_size - original_size} new translations"
            else
              cli_log '  - No updates needed'
            end
          end

          def merge_translations(existing_hash, json_data, current_path = []) # rubocop:disable Metrics/PerceivedComplexity
            json_data.each do |key, value|
              new_path = current_path + [key]

              if value.is_a?(Hash)
                # If it's a nested hash, recurse deeper
                if existing_hash.key?(key) && !existing_hash[key].is_a?(Hash)
                  # Check if the existing value is empty (nil, empty string, etc.)
                  if existing_hash[key].nil? || existing_hash[key] == ''
                    # Replace empty value with hash and continue
                    existing_hash[key] = {}
                    merge_translations(existing_hash[key], value, new_path)
                  else
                    # Key exists but is not a hash (leaf node), skip this branch
                    skip_branch(value, new_path)
                  end
                else
                  existing_hash[key] ||= {}
                  merge_translations(existing_hash[key], value, new_path)
                end
              else
                # It's a leaf node (translation string)
                path_string = new_path.join('.')

                if can_set_translation?(existing_hash, key)
                  existing_hash[key] = value
                  cli_log "    + Added: #{path_string} = '#{value}'" if verbose
                else
                  # Key exists but is not a leaf node, skip
                  skipped_keys << { path: path_string, value: value, reason: 'Key exists as non-leaf node' }
                end
              end
            end

            existing_hash
          end

          def can_set_translation?(hash, key)
            # Can set if key doesn't exist, if it exists and is a string (leaf node),
            # or if it exists but is empty (nil or empty string)
            !hash.key?(key) || !hash[key].is_a?(Hash) || hash[key].nil? || hash[key] == ''
          end

          def skip_branch(branch_data, current_path)
            # Recursively collect all leaf nodes in this branch as skipped
            if branch_data.is_a?(Hash)
              branch_data.each do |key, value|
                new_path = current_path + [key]
                if value.is_a?(Hash)
                  skip_branch(value, new_path)
                else
                  skipped_keys << {
                    path: new_path.join('.'),
                    value: value,
                    reason: 'Parent key exists as non-hash node'
                  }
                end
              end
            else
              skipped_keys << {
                path: current_path.join('.'),
                value: branch_data,
                reason: 'Parent key exists as non-hash node'
              }
            end
          end

          def count_leaf_nodes(hash)
            return 0 unless hash.is_a?(Hash)

            count = 0
            hash.each_value do |value|
              count += if value.is_a?(Hash)
                         count_leaf_nodes(value)
                       else
                         1
                       end
            end
            count
          end

          def display_results
            cli_log "\n #{'=' * 50}"
            cli_log 'Import completed successfully!'

            if skipped_keys.any?
              cli_log "\nSkipped keys (#{skipped_keys.size}):"
              cli_log '-' * 30

              skipped_keys.each do |skipped|
                cli_log "Key: #{skipped[:path]}"
                cli_log "Value: '#{skipped[:value]}'"
                cli_log "Reason: #{skipped[:reason]}"
                cli_log ''
              end
            else
              cli_log "\nNo keys were skipped."
            end
          end

          def display_skipped_keys_if_any
            return unless skipped_keys.any?

            cli_log "  Skipped keys (#{skipped_keys.size}):"
            skipped_keys.each do |skipped|
              cli_log "    - #{skipped[:path]}: '#{skipped[:value]}' (#{skipped[:reason]})"
            end

            # Clear skipped keys for next file
            @skipped_keys = []
          end
        end
      end
    end
  end
end
