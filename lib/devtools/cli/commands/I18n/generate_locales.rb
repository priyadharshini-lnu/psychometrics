# frozen_string_literal: true

require 'yaml'
require 'fileutils'

module Devtools
  module CLI
    module Commands
      module I18n
        class GenerateLocales < Base
          desc 'Auto-detect changed keys in admin.yml, shared.yml, or enduser.yml and generate translations by mapping
                  to correct paths, or translate a specific key with provided path'

          option :create_missing,
                 type: :boolean,
                 default: true,
                 desc: 'Enable automatic creation of missing keys (default: true)',
                 alias: :cm

          option :base_dir,
                 desc: 'Base directory for locales (default: config/locales)',
                 required: false,
                 alias: :bd

          option :key,
                 desc: 'Specific key to translate',
                 required: false,
                 alias: :k

          option :path,
                 desc: 'Translation path for the key (e.g., administration.navigation.key_name)',
                 required: false,
                 alias: :p

          def call(**options)
            @create_missing = options.fetch(:create_missing, true)
            @base_dir = determine_base_dir(options[:base_dir])

            validate_base_directory

            # Check if manual key and path are provided
            if options[:key] && options[:path]
              handle_manual_translation(options[:key], options[:path])
              return
            end

            # Detect changed keys in English source files
            changed_keys_by_file = detect_changed_en_keys
            if changed_keys_by_file.empty?
              cli_error 'No unstaged changes detected in admin.yml, shared.yml, or enduser.yml.'
              return
            end

            # Flatten all changed keys for display purposes
            all_changed_keys = changed_keys_by_file.values.flatten
            @custom_paths = all_changed_keys.pluck(:path)
            @target_keys = all_changed_keys.pluck(:key)

            display_configuration

            generator = LocaleGenerator.new(@base_dir, {
              custom_paths: @custom_paths,
              target_keys: @target_keys,
              create_missing: @create_missing,
              changed_keys_by_file: changed_keys_by_file
            })
            generator.generate_all_locales
          rescue StandardError => e
            cli_error "Error during locale generation: #{e.message}"
          end

          # Returns array of hashes with path, key, value, and en_path for changed keys
          def detect_changed_en_keys
            require 'open3'

            changed_keys_by_file = {}
            english_files = ['admin.yml', 'shared.yml', 'enduser.yml']

            english_files.each do |file_name|
              en_file_path = File.join(@base_dir, 'en', file_name)
              next unless File.exist?(en_file_path)

              added_lines = extract_added_lines_from_git_diff(en_file_path)
              all_key_paths = load_and_parse_en_yml_structure(en_file_path)

              file_changed_keys = process_added_lines_for_changed_keys(added_lines, all_key_paths)

              if file_changed_keys.any?
                changed_keys_by_file[file_name] = file_changed_keys
                cli_log "🔍 Found #{file_changed_keys.length} changed keys in #{file_name}"
              end
            end

            changed_keys_by_file
          end

          # Handle manual translation when user provides key and path
          def handle_manual_translation(key, path)
            cli_log '🎯 Manual translation mode'
            cli_log "Key: #{key}"
            cli_log "Path: #{path}"

            # Validate the provided path exists in translation files
            unless validate_translation_path(path)
              cli_error "Translation path '#{path}' not found in translation files"
              return
            end

            # Get English value for the key
            english_value = get_english_value_for_manual_key(key)
            unless english_value
              cli_error "Key '#{key}' not found in English source files (admin.yml, shared.yml, enduser.yml)"
              return
            end

            cli_log "English value: #{english_value}"

            # Use the provided path and key for translation
            @custom_paths = [path]
            @target_keys = [key]

            display_configuration

            generator = LocaleGenerator.new(@base_dir, @custom_paths, @target_keys, @create_missing)
            generator.generate_all_locales
          end

          # Validate that the translation path exists in translation files
          def validate_translation_path(path)
            path_parts = path.split('.')

            # Check all English source files
            english_files = ['admin.yml', 'shared.yml', 'enduser.yml']

            english_files.each do |file_name|
              en_file = File.join(@base_dir, 'en', file_name)
              next unless File.exist?(en_file)

              en_data = YAML.load_file(en_file)
              return true if en_data && en_data['en'] && path_exists_in_structure?(en_data['en'], path_parts)
            end

            # Check administration.yml (translation source)
            admin_file = File.join(@base_dir, 'en', 'administration.yml')
            if File.exist?(admin_file)
              admin_data = YAML.load_file(admin_file)
              return true if path_exists_in_structure?(admin_data['en'], path_parts)
            end

            # Check others.yml (translation source)
            others_file = File.join(@base_dir, 'en', 'others.yml')
            if File.exist?(others_file)
              others_data = YAML.load_file(others_file)
              return true if path_exists_in_structure?(others_data['en'], path_parts)
            end

            false
          end

          # Check if a path exists in a nested hash structure
          def path_exists_in_structure?(structure, path_parts)
            return false unless structure.is_a?(Hash)
            return true if path_parts.empty?

            current_part = path_parts.first
            remaining_parts = path_parts[1..]

            return false unless structure.key?(current_part)

            if remaining_parts.empty?
              # We've reached the final part, check if it exists and has a value
              structure[current_part].is_a?(String) || structure[current_part].is_a?(Hash)
            else
              # Continue traversing
              path_exists_in_structure?(structure[current_part], remaining_parts)
            end
          end

          # Get English value for a manually specified key
          def get_english_value_for_manual_key(key)
            english_files = ['admin.yml', 'shared.yml', 'enduser.yml']

            english_files.each do |file_name|
              en_file = File.join(@base_dir, 'en', file_name)
              next unless File.exist?(en_file)

              en_data = YAML.load_file(en_file)
              result = find_key_value_in_structure(en_data['en'], key)
              return result if result
            end

            nil
          end

          # Helper method to find a key's value in nested structure
          def find_key_value_in_structure(structure, target_key)
            return nil unless structure.is_a?(Hash)

            structure.each do |key, value|
              return value if key == target_key && value.is_a?(String)

              if value.is_a?(Hash)
                result = find_key_value_in_structure(value, target_key)
                return result if result
              end
            end

            nil
          end

          private

          def extract_added_lines_from_git_diff(en_yml_path)
            diff_output, = Open3.capture2('git', '--no-pager', 'diff', '--unified=0', en_yml_path)
            diff_output.lines.select { |l| l.start_with?('+') && !l.start_with?('+++') }
          end

          def load_and_parse_en_yml_structure(en_yml_path)
            en_yml = YAML.load_file(en_yml_path)
            en_hash = en_yml['en']

            all_key_paths = []
            collect_yaml_paths(en_hash, '', all_key_paths)
            all_key_paths
          end

          def process_added_lines_for_changed_keys(added_lines, all_key_paths)
            changed_keys = []

            added_lines.each do |line|
              key_info = parse_added_line(line)
              next unless key_info

              match = find_matching_key_path(key_info, all_key_paths)
              next unless match

              cli_log "📍 Found changed key '#{key_info[:key]}' at English source file path: #{match[:path]}"

              changed_key_data = build_changed_key_data(key_info, match)
              changed_keys << changed_key_data if changed_key_data
            end

            changed_keys
          end

          def parse_added_line(line)
            line_content = line[1..].strip
            return nil unless line_content =~ /^([\w-]+):\s*(.+)$/

            {
              key: ::Regexp.last_match(1),
              value: ::Regexp.last_match(2).strip.gsub(/^["']|["']$/, '') # Remove quotes if present
            }
          end

          def find_matching_key_path(key_info, all_key_paths)
            all_key_paths.find do |info|
              info[:key] == key_info[:key] && info[:value].to_s.strip == key_info[:value]
            end
          end

          def build_changed_key_data(key_info, match)
            translation_path = map_en_path_to_translation_path(match[:path], key_info[:key], key_info[:value])

            if translation_path
              cli_log "✅ Mapped to translation path: #{translation_path}"
              create_changed_key_entry(translation_path, key_info, match)
            else
              handle_fallback_path_mapping(key_info, match)
            end
          end

          def create_changed_key_entry(translation_path, key_info, match)
            {
              path: translation_path,
              key: key_info[:key],
              value: key_info[:value],
              en_path: match[:path]
            }
          end

          def handle_fallback_path_mapping(key_info, match)
            cli_log "⚠️  Could not map English source file path '#{match[:path]}' to translation file path"
            fallback_path = determine_fallback_path(match[:path], key_info[:key])

            if fallback_path
              cli_log "🔄 Using fallback path: #{fallback_path}"
              create_changed_key_entry(fallback_path, key_info, match)
            end
          end

          def template_values_match?(target_value, value)
            return false unless target_value.include?('%{')

            target_normalized = target_value.strip.downcase.gsub(/%\{[^}]+\}/, '').strip
            value_normalized = value.strip.downcase.gsub(/%\{[^}]+\}/, '').strip
            target_normalized == value_normalized
          end

          public

          # Map English source file paths to translation file paths by searching for the English value
          def map_en_path_to_translation_path(en_path, _key, value)
            # Search for the English value in translation files to find the correct path
            found_path = search_for_value_in_translation_files(value)
            return found_path if found_path

            # Fallback: try simple path mapping
            if en_path.start_with?('admin.')
              admin_subpath = en_path.sub(/^admin\./, '')
              return "administration.#{admin_subpath}"
            elsif en_path.start_with?('shared.')
              shared_subpath = en_path.sub(/^shared\./, '')
              return "common.#{shared_subpath}"
            end

            nil
          end

          # Search for a specific English value in translation files to find its path
          def search_for_value_in_translation_files(target_value)
            # Get all matching paths from English files
            all_matches = []

            # Search in all English source files
            english_files = ['admin.yml', 'shared.yml', 'enduser.yml']

            english_files.each do |file_name|
              en_file = File.join(@base_dir, 'en', file_name)
              next unless File.exist?(en_file)

              en_data = YAML.load_file(en_file)
              if en_data && en_data['en']
                find_all_value_matches(en_data['en'], target_value, '', all_matches)
              end
            end

            # Search in administration.yml (for translation source)
            en_admin_file = File.join(@base_dir, 'en', 'administration.yml')
            if File.exist?(en_admin_file)
              en_admin_data = YAML.load_file(en_admin_file)
              if en_admin_data['en']
                find_all_value_matches(en_admin_data['en'], target_value, '', all_matches)
              end
            end

            # Search in others.yml (for translation source)
            en_others_file = File.join(@base_dir, 'en', 'others.yml')
            if File.exist?(en_others_file)
              en_others_data = YAML.load_file(en_others_file)
              if en_others_data['en']
                find_all_value_matches(en_others_data['en'], target_value, '', all_matches)
              end
            end

            # If multiple matches found, prioritize the best one
            if all_matches.any?
              best_path = prioritize_translation_path(all_matches, target_value)
              puts "    🎯 Found English value '#{target_value}' at path '#{best_path}'"
              return best_path
            end

            nil
          end

          # Find all paths where a value matches in the structure
          def find_all_value_matches(structure, target_value, current_path, matches)
            return unless structure.is_a?(Hash)

            structure.each do |key, value|
              new_path = current_path.empty? ? key : "#{current_path}.#{key}"

              if value.is_a?(Hash)
                find_all_value_matches(value, target_value, new_path, matches)
              elsif value.is_a?(String)
                # Check for exact match
                if value.strip.downcase == target_value.strip.downcase
                  matches << new_path
                end

                # For success messages, also try to match templates
                if template_values_match?(target_value, value)
                  matches << new_path
                end
              end
            end
          end

          # Prioritize translation paths based on common patterns
          def prioritize_translation_path(paths, target_value)
            # For simple entity names like "Campaigns", prefer navigation/breadcrumbs over permissions
            if paths.any? { |path| path.include?('breadcrumbs') }
              return paths.find { |path| path.include?('breadcrumbs') }
            end

            # For simple entity names, prefer navigation over other complex paths
            if paths.any? { |path| path.include?('navigation') }
              return paths.find { |path| path.include?('navigation') }
            end

            # For success messages, prefer the first match (they should be unique anyway)
            if target_value.include?('successfully')
              return paths.first
            end

            # Default: return the shortest path (usually more general)
            paths.min_by(&:length)
          end

          # Get a sample language for structure analysis
          def get_sample_language_for_structure_analysis
            Dir.entries(@base_dir).
              select { |entry| File.directory?(File.join(@base_dir, entry)) }.
              reject { |entry| entry.start_with?('.') || entry == 'en' }.
              first
          end

          # Determine fallback path when mapping fails
          def determine_fallback_path(en_path, _key)
            # If it's an admin key, try to find it in administration structure
            if en_path.start_with?('admin.')
              # Use simple path mapping as fallback
              admin_subpath = en_path.sub(/^admin\./, '')
              return "administration.#{admin_subpath}"
            end

            # Default fallback - use the English source file path
            en_path
          end

          # Recursively collect all key paths in YAML
          def collect_yaml_paths(obj, prefix, result)
            if obj.is_a?(Hash)
              obj.each do |k, v|
                new_prefix = prefix.empty? ? k : "#{prefix}.#{k}"
                if v.is_a?(Hash)
                  collect_yaml_paths(v, new_prefix, result)
                else
                  result << { path: new_prefix, key: k, value: v }
                end
              end
            end
          end

          private

          # extract_comma_separated no longer needed

          def determine_base_dir(base_dir)
            return base_dir if base_dir

            # Try from current directory
            current_dir_locales = File.join(Dir.pwd, 'config', 'locales')
            return current_dir_locales if Dir.exist?(current_dir_locales)

            # Try from Rails root
            rails_root_locales = File.join(File.dirname(__FILE__), '../../../../config', 'locales')
            return rails_root_locales if Dir.exist?(rails_root_locales)

            current_dir_locales
          end

          def validate_base_directory
            return if Dir.exist?(@base_dir)

            cli_error "Could not find locales directory at: #{@base_dir}. " \
                      'Please run this command from the Rails root directory or specify --base-dir.'
          end

          def display_configuration
            display_translation_mode
            cli_log "Base directory: #{@base_dir}"
            cli_log 'Will only create keys that exist in English source files (admin.yml, shared.yml, enduser.yml)'
            display_paths_and_keys
            display_create_missing_status
          end

          def display_translation_mode
            if @custom_paths&.length == 1 && @target_keys&.length == 1
              cli_log 'Starting manual translation...'
              cli_log "Target key: #{@target_keys.first}"
              cli_log "Translation path: #{@custom_paths.first}"
            else
              cli_log 'Starting locale generation...'
            end
          end

          def display_paths_and_keys
            if @custom_paths&.any?
              cli_log "Detected/provided paths: #{@custom_paths.join(', ')}"
            end

            if @target_keys&.any?
              cli_log "Detected/provided keys: #{@target_keys.join(', ')}"
            end
          end

          def display_create_missing_status
            if @create_missing
              cli_log 'Creating missing keys in target languages'
            end
          end

          # Internal class to handle the locale generation logic
          class LocaleGenerator
            attr_reader :base_dir, :custom_paths, :target_keys, :create_missing,
                        :en_structure, :language_codes

            def initialize(base_dir, options = {})
              @base_dir = base_dir
              @custom_paths = ensure_array(options[:custom_paths])
              @target_keys = ensure_array(options[:target_keys])
              @create_missing = options.fetch(:create_missing, true)
              @changed_keys_by_file = options.fetch(:changed_keys_by_file, {})
              @en_structure = load_en_structure
              @language_codes = get_language_codes

              display_initialization_info
            end

            def generate_all_locales
              language_codes.each do |lang_code|
                puts "\nProcessing #{lang_code}..."
                generate_locale_file(lang_code)
              end
              puts "\n✅ All locale files have been generated successfully!"
            end

            private

            def ensure_array(value)
              return nil if value.nil?
              return value if value.is_a?(Array)

              [value]
            end

            def display_initialization_info
              puts "Found #{language_codes.count} languages: #{language_codes.join(', ')}"

              if custom_paths
                puts "🎯 Using custom paths for translations: #{custom_paths.join(', ')}"
              end

              if target_keys
                puts "🎯 Updating keys: #{target_keys.join(', ')}"
              end

              puts '🎯 Creating missing keys in target languages' if create_missing
            end

            # Get keys specific to a particular file
            def get_keys_for_file(file_name)
              return [] unless @changed_keys_by_file[file_name]

              @changed_keys_by_file[file_name].pluck(:key)
            end

            def load_en_structure
              english_files = ['admin.yml', 'shared.yml', 'enduser.yml']
              combined_structure = {}

              english_files.each do |file_name|
                en_file = File.join(base_dir, 'en', file_name)
                next unless File.exist?(en_file)

                content = YAML.load_file(en_file)
                if content && content['en']
                  combined_structure.merge!(content['en'])
                end
              end

              raise "No English structure files found in: #{english_files.join(', ')}" if combined_structure.empty?

              combined_structure
            end

            def get_language_codes
              Dir.entries(base_dir).
                select { |entry| File.directory?(File.join(base_dir, entry)) }.
                reject { |entry| entry.start_with?('.') || entry == 'en' }.
                sort
            end

            def generate_locale_file(lang_code)
              translation_files = prepare_translation_files(lang_code)
              return unless translation_files

              process_target_files(lang_code, translation_files)
            rescue StandardError => e
              puts "  ❌ Error processing #{lang_code}: #{e.message}"
            end

            def prepare_translation_files(lang_code)
              admin_file = File.join(base_dir, lang_code, 'administration.yml')
              others_file = File.join(base_dir, lang_code, 'others.yml')

              return nil unless validate_source_files(admin_file, others_file)

              admin_data = YAML.load_file(admin_file)
              others_data = YAML.load_file(others_file)

              {
                admin: admin_data[lang_code] || {},
                others: others_data[lang_code] || {}
              }
            end

            def process_target_files(lang_code, translations)
              files_to_process = determine_files_to_process

              files_to_process.each do |file_name|
                process_single_target_file(lang_code, file_name, translations)
              end
            end

            def determine_files_to_process
              if @changed_keys_by_file.any?
                @changed_keys_by_file.keys
              else
                ['admin.yml', 'shared.yml', 'enduser.yml']
              end
            end

            def process_single_target_file(lang_code, file_name, translations)
              en_source_file = File.join(base_dir, 'en', file_name)
              return unless File.exist?(en_source_file)

              output_file = File.join(base_dir, lang_code, file_name)

              if target_keys
                process_specific_keys(output_file, lang_code, file_name, translations)
              else
                generate_complete_structure_for_file(output_file, lang_code, translations[:admin],
                                                     translations[:others], file_name)
              end
            end

            def process_specific_keys(output_file, lang_code, file_name, translations)
              file_specific_keys = get_keys_for_file(file_name)
              return if file_specific_keys.empty?

              update_specific_keys_for_file(output_file, lang_code, translations, file_name, file_specific_keys)
            end

            public

            def validate_source_files(admin_file, others_file)
              unless File.exist?(admin_file)
                puts "  ⚠️  Administration file not found: #{admin_file}"
                return false
              end

              unless File.exist?(others_file)
                puts "  ⚠️  Others file not found: #{others_file}"
                return false
              end

              true
            end

            def generate_complete_structure_for_file(
              output_file, lang_code, admin_translations, others_translations, source_file_name
            )
              en_source_file = File.join(base_dir, 'en', source_file_name)
              return unless File.exist?(en_source_file)

              en_data = YAML.load_file(en_source_file)
              return unless en_data && en_data['en']

              new_structure = build_structure_from_en_file(en_data['en'], admin_translations, others_translations)
              write_yaml_file(output_file, { lang_code => new_structure })
              puts "  ✅ Generated: #{output_file}"
            end

            def generate_complete_structure(output_file, lang_code, admin_translations, others_translations)
              new_structure = build_structure_from_en(lang_code, admin_translations, others_translations)
              write_yaml_file(output_file, { lang_code => new_structure })
              puts "  ✅ Generated: #{output_file}"
            end

            def update_specific_keys_for_file(output_file, lang_code, translations, source_file_name,
                                              file_specific_keys = nil)
              en_source_file = File.join(base_dir, 'en', source_file_name)
              return unless File.exist?(en_source_file)

              en_data = YAML.load_file(en_source_file)
              return unless en_data && en_data['en']

              admin_translations = translations[:admin]
              others_translations = translations[:others]

              current_structure = load_or_create_structure_for_file(
                output_file, lang_code, admin_translations, others_translations, en_data['en']
              )

              # Use file-specific keys if provided, otherwise fall back to global target_keys
              keys_to_process = file_specific_keys || target_keys

              context = {
                current_structure: current_structure,
                admin_translations: admin_translations,
                others_translations: others_translations,
                en_file_structure: en_data['en'],
                keys_to_process: keys_to_process,
                source_file_name: source_file_name
              }
              updated_keys, created_keys = process_target_keys_for_file(context)

              save_and_report_changes(output_file, lang_code, current_structure, updated_keys, created_keys)
            end

            def update_specific_keys(output_file, lang_code, admin_translations, others_translations)
              current_structure = load_or_create_structure(output_file, lang_code, admin_translations,
                                                           others_translations)
              updated_keys, created_keys = process_target_keys(current_structure, admin_translations,
                                                               others_translations)

              save_and_report_changes(output_file, lang_code, current_structure, updated_keys, created_keys)
            end

            def load_or_create_structure_for_file(
              output_file, lang_code, admin_translations, others_translations, en_file_structure
            )
              if File.exist?(output_file)
                existing_data = YAML.load_file(output_file)
                existing_data[lang_code] || {}
              else
                build_structure_from_en_file(en_file_structure, admin_translations, others_translations)
              end
            end

            def load_or_create_structure(output_file, lang_code, admin_translations, others_translations)
              if File.exist?(output_file)
                existing_data = YAML.load_file(output_file)
                existing_data[lang_code] || {}
              else
                build_structure_from_en(lang_code, admin_translations, others_translations)
              end
            end

            def process_target_keys_for_file(context)
              current_structure = context[:current_structure]
              admin_translations = context[:admin_translations]
              others_translations = context[:others_translations]
              en_file_structure = context[:en_file_structure]
              keys_to_process = context[:keys_to_process]
              source_file_name = context[:source_file_name]

              updated_keys = []
              created_keys = []
              keys_list = keys_to_process || target_keys

              keys_list.each do |target_key|
                key_context = {
                  current_structure: current_structure,
                  admin_translations: admin_translations,
                  others_translations: others_translations,
                  en_file_structure: en_file_structure,
                  updated_keys: updated_keys,
                  created_keys: created_keys,
                  source_file_name: source_file_name
                }
                process_single_target_key(target_key, key_context)
              end

              [updated_keys, created_keys]
            end

            private

            def process_single_target_key(target_key, context)
              key_exists_in_en = key_exists_in_structure?(context[:en_file_structure], target_key)

              if key_exists_in_en
                handle_existing_key(target_key, context)
              elsif create_missing
                handle_missing_key(target_key, context)
              else
                puts "  ⚠️  Key '#{target_key}' not found in English file structure"
              end
            end

            def handle_existing_key(target_key, context)
              current_structure = context[:current_structure]
              admin_translations = context[:admin_translations]
              others_translations = context[:others_translations]
              updated_keys = context[:updated_keys]
              created_keys = context[:created_keys]
              source_file_name = context[:source_file_name]

              if update_key_in_structure(current_structure, target_key, admin_translations, others_translations)
                updated_keys << target_key
              elsif create_missing && create_missing_key(current_structure, target_key, admin_translations,
                                                         others_translations, source_file_name)
                created_keys << target_key
              end
            end

            def handle_missing_key(target_key, context)
              current_structure = context[:current_structure]
              admin_translations = context[:admin_translations]
              others_translations = context[:others_translations]
              created_keys = context[:created_keys]
              source_file_name = context[:source_file_name]

              return unless create_missing_key(current_structure, target_key, admin_translations, others_translations,
                                               source_file_name)

              created_keys << target_key
            end

            public

            def process_target_keys(current_structure, admin_translations, others_translations)
              updated_keys = []
              created_keys = []

              target_keys.each do |target_key|
                key_exists_in_en = key_exists_in_structure?(en_structure, target_key)

                if key_exists_in_en
                  if update_key_in_structure(current_structure, target_key, admin_translations, others_translations)
                    updated_keys << target_key
                  elsif create_missing && create_missing_key(current_structure, target_key, admin_translations,
                                                             others_translations)
                    created_keys << target_key
                  end
                elsif create_missing && create_missing_key(current_structure, target_key, admin_translations,
                                                           others_translations)
                  created_keys << target_key
                else
                  puts "  ⚠️  Key '#{target_key}' not found in en.yml structure"
                end
              end

              [updated_keys, created_keys]
            end

            def save_and_report_changes(output_file, lang_code, current_structure, updated_keys, created_keys)
              if updated_keys.any? || created_keys.any?
                write_yaml_file(output_file, { lang_code => current_structure })

                if updated_keys.any?
                  puts "  ✅ Updated keys '#{updated_keys.join(', ')}' in: #{output_file}"
                end

                if created_keys.any?
                  puts "  ✅ Created keys '#{created_keys.join(', ')}' in: #{output_file}"
                end
              else
                puts '  ⚠️  No keys were updated or created'
              end
            end

            def key_exists_in_structure?(structure, target_key)
              return false unless structure.is_a?(Hash)

              structure.any? do |_section_key, section_value|
                next false unless section_value.is_a?(Hash)

                section_value.key?(target_key) || key_exists_in_nested_structure?(section_value, target_key)
              end
            end

            def key_exists_in_nested_structure?(hash, target_key)
              return false unless hash.is_a?(Hash)

              hash.any? do |key, value|
                key == target_key || (value.is_a?(Hash) && key_exists_in_nested_structure?(value, target_key))
              end
            end

            def create_missing_key(structure, target_key, admin_translations, others_translations,
                                   source_file_name = nil)
              translation = find_translation_with_custom_paths(target_key, admin_translations, others_translations)
              translation ||= find_translation_for_admin_key(target_key, target_key, admin_translations,
                                                             others_translations)

              # If no translation found, get the English value as fallback
              if !translation || translation == target_key
                english_value = get_english_value_for_key(target_key)
                if english_value
                  puts "    ⚠️  No translation found for '#{target_key}', using English fallback: '#{english_value}'"
                  translation = english_value
                else
                  puts "    ❌ No English value found for key '#{target_key}'"
                  return false
                end
              end

              add_translation_to_structure(structure, target_key, translation, source_file_name)
              true
            end

            def find_translation_with_custom_paths(target_key, admin_translations, others_translations)
              return nil unless custom_paths && target_keys

              if custom_paths.length == target_keys.length
                find_mapped_path_translation(target_key, admin_translations, others_translations)
              else
                find_any_path_translation(target_key, admin_translations, others_translations)
              end
            end

            def find_mapped_path_translation(target_key, admin_translations, others_translations)
              key_index = target_keys.index(target_key)
              return nil unless key_index && key_index < custom_paths.length

              specific_path = custom_paths[key_index]
              translation = find_translation_by_path_any_key(specific_path, admin_translations, others_translations)

              if translation
                puts "    ✅ Using mapped path '#{specific_path}' for key '#{target_key}'"
              end

              translation
            end

            def find_any_path_translation(target_key, admin_translations, others_translations)
              custom_paths.each do |path|
                translation = find_translation_by_path_any_key(path, admin_translations, others_translations)
                if translation
                  puts "    ✅ Found translation for '#{target_key}' at path '#{path}': '#{translation}'"
                  return translation
                end
              end

              # If no translation found in any custom path, return nil to trigger fallback
              puts "    ⚠️  No translation found for '#{target_key}' in any custom path"
              nil
            end

            def add_translation_to_structure(structure, target_key, translation, source_file_name = nil)
              # Determine the appropriate section based on source file name
              if source_file_name == 'enduser.yml'
                # For enduser files, add keys directly to the enduser section
                if structure['enduser']
                  structure['enduser'][target_key] = translation
                  puts "    📝 Created '#{target_key}' in enduser section: '#{translation}'"
                else
                  structure['enduser'] = { target_key => translation }
                  puts "    📝 Created enduser section with '#{target_key}': '#{translation}'"
                end
              elsif structure['admin']
                structure['admin'][target_key] = translation
                puts "    📝 Created '#{target_key}' in admin section: '#{translation}'"
              elsif structure['shared']
                structure['shared'][target_key] = translation
                puts "    📝 Created '#{target_key}' in shared section: '#{translation}'"
              else
                # Default to admin section for admin.yml and shared.yml files
                structure['admin'] = { target_key => translation }
                puts "    📝 Created admin section with '#{target_key}': '#{translation}'"
              end
            end

            def get_english_value_for_key(target_key)
              # Search for the key in the English structure (which is now combined from multiple files)
              find_key_value_in_nested_structure(en_structure, target_key)
            end

            # Helper method to find a key's value in nested structure (same as parent class method)
            def find_key_value_in_nested_structure(structure, target_key)
              return nil unless structure.is_a?(Hash)

              structure.each do |key, value|
                return value if key == target_key && value.is_a?(String)

                if value.is_a?(Hash)
                  result = find_key_value_in_nested_structure(value, target_key)
                  return result if result
                end
              end

              nil
            end

            def find_translation_by_path_any_key(path, admin_translations, others_translations)
              puts "    🔍 Searching for translation at path: #{path}"

              translation = if path.start_with?('admin.')
                              find_admin_prefixed_translation(path, admin_translations, others_translations)
                            elsif path.start_with?('shared.')
                              find_shared_prefixed_translation(path, admin_translations, others_translations)
                            else
                              find_regular_path_translation(path, admin_translations, others_translations)
                            end

              if translation
                translation
              else
                puts "    ❌ No value found at path: #{path}"
                nil
              end
            end

            private

            def find_admin_prefixed_translation(path, admin_translations, others_translations)
              key_name = path.sub('admin.', '')
              puts "    🔍 Looking for admin key '#{key_name}' in administration structure"

              # Try to find the key in admin translations
              translation = find_key_in_admin_structure(key_name, admin_translations)
              if translation
                puts "    ✅ Found admin translation for '#{key_name}': '#{translation}'"
                return translation
              end

              # Try to find in others as fallback
              translation = find_key_in_others_structure(key_name, others_translations)
              if translation
                puts "    ✅ Found fallback translation for '#{key_name}': '#{translation}'"
                return translation
              end

              nil
            end

            def find_shared_prefixed_translation(path, admin_translations, others_translations)
              key_name = path.sub('shared.', '')
              puts "    🔍 Looking for shared key '#{key_name}' in others structure"

              # Try to find the key in others translations first
              translation = find_key_in_others_structure(key_name, others_translations)
              if translation
                puts "    ✅ Found shared translation for '#{key_name}': '#{translation}'"
                return translation
              end

              # Try to find in admin as fallback
              translation = find_key_in_admin_structure(key_name, admin_translations)
              if translation
                puts "    ✅ Found fallback translation for '#{key_name}': '#{translation}'"
                return translation
              end

              nil
            end

            def find_regular_path_translation(path, admin_translations, others_translations)
              path_parts = path.split('.')
              [admin_translations, others_translations].each do |translations|
                current_hash = navigate_to_path(translations, path_parts)
                next unless current_hash

                translation = extract_translation_from_hash(current_hash, path)
                return translation if translation
              end

              nil
            end

            public

            def navigate_to_path(translations, path_parts)
              current_hash = translations
              path_parts.each do |part|
                if current_hash.is_a?(Hash) && current_hash.key?(part)
                  current_hash = current_hash[part]
                else
                  return nil
                end
              end
              current_hash
            end

            def extract_translation_from_hash(current_hash, path)
              if current_hash.is_a?(Hash)
                extract_preferred_translation(current_hash, path)
              elsif current_hash.is_a?(String) && !current_hash.empty?
                puts "    ✅ Found direct value at path '#{path}': '#{current_hash}'"
                current_hash
              end
            end

            def extract_preferred_translation(hash, path)
              preferred_keys = %w[name title label]

              preferred_keys.each do |pref_key|
                if hash.key?(pref_key) && hash[pref_key].is_a?(String)
                  puts "    ✅ Found preferred key '#{pref_key}' at path '#{path}': '#{hash[pref_key]}'"
                  return hash[pref_key]
                end
              end

              # If no preferred key found, pick any string value
              hash.each do |key, val|
                if val.is_a?(String) && !val.empty?
                  puts "    ✅ Found value at path '#{path}' (key: #{key}): '#{val}'"
                  return val
                end
              end

              nil
            end

            def update_key_in_structure(structure, target_key, admin_translations, others_translations)
              updated = false

              structure.each do |section_key, section_value|
                next unless section_value.is_a?(Hash)

                section_value.each do |key, value|
                  if key == target_key
                    translations = { admin: admin_translations, others: others_translations }
                    key_info = [key, value, target_key]
                    updated = update_single_key(structure, section_key, key_info, translations) || updated
                  elsif value.is_a?(Hash)
                    updated = update_key_in_nested_structure(value, target_key, admin_translations,
                                                             others_translations) || updated
                  end
                end
              end

              updated
            end

            def update_single_key(structure, section_key, key_info, translations)
              key, value, target_key = key_info
              new_value = find_new_value_for_key(key, value, section_key, target_key, translations)

              puts "    📝 Updating '#{key}': '#{value}' → '#{new_value}'" if new_value != value

              structure[section_key][key] = new_value
              true
            end

            def find_new_value_for_key(key, value, section_key, target_key, translations)
              admin_translations = translations[:admin]
              others_translations = translations[:others]

              # Use mapped path if available
              if custom_paths && target_keys && (custom_paths.length == target_keys.length)
                key_index = target_keys.index(target_key)
                if key_index && key_index < custom_paths.length
                  specific_path = custom_paths[key_index]
                  new_value = find_translation_by_path_any_key(specific_path, admin_translations, others_translations)
                  if new_value
                    puts "    ✅ Using mapped path '#{specific_path}' for key '#{target_key}'"
                    return new_value
                  else
                    puts "    ⚠️  No translation found at mapped path '#{specific_path}' for key " \
                         "'#{target_key}', using English fallback"
                    return value # Return the English value as fallback
                  end
                end
              end

              # Fallback to original logic
              case section_key
                when 'shared'
                  find_translation_for_shared_key(key, value, admin_translations, others_translations)
                else
                  find_translation_for_admin_key(key, value, admin_translations, others_translations)
              end
            end

            def update_key_in_nested_structure(hash, target_key, admin_translations, others_translations)
              updated = false

              hash.each do |key, value|
                if key == target_key
                  new_value = find_translation_for_admin_key(key, value, admin_translations, others_translations)
                  puts "    📝 Updating nested '#{key}': '#{value}' → '#{new_value}'" if new_value != value
                  hash[key] = new_value
                  updated = true
                elsif value.is_a?(Hash)
                  updated = update_key_in_nested_structure(value, target_key, admin_translations,
                                                           others_translations) || updated
                end
              end

              updated
            end

            def build_structure_from_en_file(en_file_structure, admin_translations, others_translations)
              structure = {}

              en_file_structure.each do |section_key, section_value|
                structure[section_key] = case section_key
                                           when 'shared'
                                             build_shared_section_from_en_file(
                                               section_value, admin_translations, others_translations
                                             )
                                           when 'admin'
                                             build_admin_section_from_en_file(
                                               section_value, admin_translations, others_translations
                                             )
                                           else
                                             process_section_recursively(section_value, admin_translations,
                                                                         others_translations)
                                         end
              end

              structure
            end

            def build_structure_from_en(_lang_code, admin_translations, others_translations)
              structure = {}

              en_structure.each do |section_key, section_value|
                structure[section_key] = case section_key
                                           when 'shared'
                                             build_shared_section_from_en(admin_translations, others_translations)
                                           when 'admin'
                                             build_admin_section_from_en(admin_translations, others_translations)
                                           else
                                             process_section_recursively(section_value, admin_translations,
                                                                         others_translations)
                                         end
              end

              structure
            end

            def build_shared_section_from_en_file(en_shared_structure, admin_translations, others_translations)
              shared = {}

              en_shared_structure.each do |key, value|
                shared[key] = if key == 'table' && value.is_a?(Hash)
                                build_table_section_from_admin_file(value, admin_translations, others_translations)
                              elsif value.is_a?(Hash)
                                process_section_recursively(value, admin_translations, others_translations)
                              else
                                find_translation_for_shared_key(key, value, admin_translations, others_translations)
                              end
              end

              shared
            end

            def build_shared_section_from_en(admin_translations, others_translations)
              shared = {}
              en_shared = en_structure['shared'] || {}

              en_shared.each do |key, value|
                shared[key] = if key == 'table' && value.is_a?(Hash)
                                build_table_section_from_admin(admin_translations, others_translations)
                              elsif value.is_a?(Hash)
                                process_section_recursively(value, admin_translations, others_translations)
                              else
                                find_translation_for_shared_key(key, value, admin_translations, others_translations)
                              end
              end

              shared
            end

            def build_table_section_from_admin_file(en_table_structure, admin_translations, others_translations)
              admin_table = admin_translations.dig('administration', 'table') || {}
              result = {}

              en_table_structure.each do |key, value|
                result[key] = if key == 'entries' && admin_table['entries']
                                puts '    📝 Using administration.table.entries structure for table.entries'
                                admin_table['entries']
                              elsif value.is_a?(Hash)
                                process_section_recursively(value, admin_translations, others_translations)
                              else
                                find_translation_for_shared_key(key, value, admin_translations, others_translations)
                              end
              end

              result
            end

            def build_table_section_from_admin(admin_translations, others_translations)
              admin_table = admin_translations.dig('administration', 'table') || {}
              en_table = en_structure['shared']['table'] || {}
              result = {}

              en_table.each do |key, value|
                result[key] = if key == 'entries' && admin_table['entries']
                                puts '    📝 Using administration.table.entries structure for table.entries'
                                admin_table['entries']
                              elsif value.is_a?(Hash)
                                process_section_recursively(value, admin_translations, others_translations)
                              else
                                find_translation_for_shared_key(key, value, admin_translations, others_translations)
                              end
              end

              result
            end

            def build_admin_section_from_en_file(en_admin_structure, admin_translations, others_translations)
              admin = {}

              en_admin_structure.each do |key, value|
                if value.is_a?(Hash)
                  admin[key] = process_section_recursively(value, admin_translations, others_translations)
                else
                  translated_value = find_translation_for_admin_key(
                    key, value, admin_translations, others_translations
                  )
                  admin[key] = translated_value if translated_value
                end
              end

              admin
            end

            def build_admin_section_from_en(admin_translations, others_translations)
              admin = {}
              en_admin = en_structure['admin'] || {}

              en_admin.each do |key, value|
                if value.is_a?(Hash)
                  admin[key] = process_section_recursively(value, admin_translations, others_translations)
                else
                  translated_value = find_translation_for_admin_key(
                    key, value, admin_translations, others_translations
                  )
                  admin[key] = translated_value if translated_value
                end
              end

              admin
            end

            def process_section_recursively(en_section, admin_translations, others_translations)
              result = {}

              en_section.each do |key, value|
                result[key] = if value.is_a?(Hash)
                                process_section_recursively(value, admin_translations, others_translations)
                              else
                                find_translation_for_shared_key(key, value, admin_translations, others_translations)
                              end
              end

              result
            end

            def find_translation_for_shared_key(key, en_value, admin_translations, others_translations)
              # Try common.actions first
              return others_translations.dig('common', 'actions', key) if others_translations.dig('common', 'actions',
                                                                                                  key)

              # Try common.text
              return others_translations.dig('common', 'text', key) if others_translations.dig('common', 'text', key)

              # Try common.column for table-related keys
              return others_translations.dig('common', 'column', key) if others_translations.dig('common', 'column',
                                                                                                 key)

              # Search broadly in others.yml
              found = find_in_nested_hash(others_translations, en_value)
              return found if found

              # Search in admin as fallback
              found = find_in_nested_hash(admin_translations, en_value)
              return found if found

              # English fallback
              puts "    ⚠️  Translation not found for shared key '#{key}': '#{en_value}', using English fallback"
              en_value
            end

            def find_translation_for_admin_key(key, en_value, admin_translations, others_translations)
              # If custom paths are provided, try those first
              custom_paths&.each do |path|
                found = find_translation_by_path_any_key(path, admin_translations, others_translations)
                if found
                  puts "    ✅ Found translation for '#{key}' at path '#{path}': '#{found}'"
                  return found
                end
              end

              # Try to find the key directly in administration structure
              found = find_key_in_admin_structure(key, admin_translations)
              return found if found

              # Try to find the key in others structure
              found = find_key_in_others_structure(key, others_translations)
              return found if found

              # Search by value in admin translations
              found = find_in_nested_hash(admin_translations, en_value)
              return found if found

              # Search by value in others translations
              found = find_in_nested_hash(others_translations, en_value)
              return found if found

              # English fallback
              puts "    ⚠️  Admin translation not found for '#{key}': '#{en_value}', using English fallback"
              en_value
            end

            # Helper method to search for key in administration structure
            def find_key_in_admin_structure(key, admin_translations)
              return nil unless valid_admin_translations?(admin_translations)

              find_in_primary_admin_sections(key, admin_translations) ||
                find_in_secondary_admin_sections(key, admin_translations) ||
                search_recursively_in_admin(key, admin_translations)
            end

            private

            def valid_admin_translations?(admin_translations)
              return true if admin_translations.is_a?(Hash)

              puts "    ❌ Admin translations is not a Hash: #{admin_translations.class}"
              false
            end

            def find_in_primary_admin_sections(key, admin_translations)
              # Try navigation first
              found = admin_translations.dig('administration', 'navigation', key)
              return found if found

              # Try breadcrumbs
              found = admin_translations.dig('administration', 'breadcrumbs', key)
              return found if found

              # Handle special case for clients_tenancies -> clients
              return admin_translations.dig('administration', 'navigation', 'clients') if key == 'clients_tenancies'

              nil
            end

            def find_in_secondary_admin_sections(key, admin_translations)
              admin_sections = %w[actions buttons forms labels messages]
              admin_section = admin_translations['administration']

              return nil unless admin_section.is_a?(Hash)

              admin_sections.each do |section|
                next unless admin_section[section].is_a?(Hash)

                found = admin_section[section][key]
                return found if found
              end

              nil
            end

            def search_recursively_in_admin(key, admin_translations)
              admin_sections = admin_translations['administration']
              return nil unless admin_sections.is_a?(Hash)

              admin_sections.each_value do |section_content|
                next unless section_content.is_a?(Hash)

                found = find_key_value_in_nested_structure(section_content, key)
                return found if found
              end

              nil
            end

            public

            # Helper method to search for key in others structure
            def find_key_in_others_structure(key, others_translations)
              # Check if others_translations is actually a Hash
              unless others_translations.is_a?(Hash)
                puts "    ❌ Others translations is not a Hash: #{others_translations.class}"
                return nil
              end

              # Try common sections
              common_sections = %w[actions text column buttons forms]
              common_sections.each do |section|
                found = others_translations.dig('common', section, key)
                return found if found
              end

              # Search recursively in all others sections
              others_translations.each_value do |content|
                next unless content.is_a?(Hash)

                found = find_key_value_in_nested_structure(content, key)
                return found if found
              end

              nil
            end

            def find_in_nested_hash(hash, target_value, path = [])
              return nil unless hash.is_a?(Hash)

              hash.each do |key, value|
                current_path = path + [key]

                return value if value == target_value

                if value.is_a?(Hash)
                  result = find_in_nested_hash(value, target_value, current_path)
                  return result if result
                end
              end

              nil
            end

            def write_yaml_file(filename, data)
              File.open(filename, 'w') do |file|
                file.write("---\n")
                file.write(data.to_yaml.sub(/^---\n/, ''))
              end
            end
          end
        end
      end
    end
  end
end
