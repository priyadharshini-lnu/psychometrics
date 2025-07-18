# frozen_string_literal: true

require 'yaml'
require 'pathname'
require 'readline'
require_relative 'translate_string'

module Devtools
  module CLI
    module Commands
      module I18n
        class FixAndReportInconsistencies < Base
          desc <<~DESC
            This command checks translation files for inconsistencies and can automatically fix them.

            When using --fix with interpolation mismatches, the command will:
            1. Use translation API to translate the English text
            2. Present the current text, translation, and ask for user choice
            3. Allow user to accept (a), reject (r), or provide manual translation (m)

            You can specify which locales to process using --locale option.

            For DeepL translation, set the DEEPL_AUTH_KEY environment variable.
            You can get a free API key at https://www.deepl.com/pro-api

            For Microsoft Translator, set MICROSOFT_TRANSLATION_API_KEY and MICROSOFT_TRANSLATION_API_REGION environment variables.
            You can get keys from Azure Cognitive Services.
          DESC

          option :files,
                 desc: 'Comma-separated list of YAML files to process ' \
                       '(default: auto-detect all files in config/locales/en/)',
                 default: nil,
                 alias: :f

          option :checks,
                 desc: 'Comma-separated list of checks to run: html, line_break, interpolation ' \
                       '(default: all checks)',
                 default: 'html,line_break,interpolation',
                 alias: :c

          option :fix,
                 desc: 'Enable automatic fixing with translation for interpolation mismatches',
                 type: :boolean,
                 default: false

          option :locale,
                 desc: 'Comma-separated list of locale codes to process (e.g., es,fr,de). ' \
                       'By default, processes all available locales',
                 default: nil,
                 alias: :l

          option :translation_provider,
                 desc: 'Translation provider to use (deepl or microsoft)',
                 default: 'deepl',
                 alias: :p

          def call(**options)
            files = options[:files]
            checks = options.fetch(:checks, 'html,line_break,interpolation')
            fix = options.fetch(:fix, false)
            locale = options[:locale]
            translation_provider = options.fetch(:translation_provider, 'deepl')

            @files_to_fix = determine_files_to_process(files)
            @checks_to_run = determine_checks_to_run(checks)
            @locales_to_process = determine_locales_to_process(locale)
            @fix = fix
            @translation_provider = translation_provider.downcase
            @total_changes = 0
            @processed_files = 0

            cli_log 'Starting interpolation argument, HTML tag, and line break inconsistency checks...'
            cli_log "Files to process: #{@files_to_fix.join(', ')}"
            cli_log "Checks to run: #{@checks_to_run.join(', ')}"
            cli_log "Locales to process: #{@locales_to_process.join(', ')}"
            cli_log "Fix mode: #{@fix ? "enabled (with #{@translation_provider.capitalize} translation)" : 'disabled'}"

            process_locale_files

            cli_log "\nSummary:"
            cli_log "  Processed #{@processed_files} locale files"
            cli_log "  Made #{@total_changes} interpolation argument fixes"
          end

          private

          def determine_files_to_process(files)
            if files.nil? || files.strip.empty?
              # Auto-detect all YAML files in the English locale directory
              english_locale_dir = locales_dir.join('en')
              return [] unless Dir.exist?(english_locale_dir)

              Dir.glob(english_locale_dir.join('*.yml')).map do |file_path|
                File.basename(file_path)
              end.sort
            else
              files.split(',').map(&:strip)
            end
          end

          def determine_checks_to_run(checks)
            return %w[html line_break interpolation] if checks.nil? || checks.strip.empty?

            valid_checks = %w[html line_break interpolation]
            requested_checks = checks.split(',').map(&:strip)

            invalid_checks = requested_checks - valid_checks
            if invalid_checks.any?
              cli_log "Invalid check types: #{invalid_checks.join(', ')}. " \
                      "Valid options: #{valid_checks.join(', ')}", :warn
            end

            requested_checks & valid_checks
          end

          def determine_locales_to_process(locale)
            if locale.nil? || locale.strip.empty?
              auto_detect_available_locales
            else
              validate_and_filter_requested_locales(locale)
            end
          end

          def auto_detect_available_locales
            available_locales = []
            Dir.glob(locales_dir.join('*')).each do |locale_path|
              locale_dir = File.basename(locale_path)
              next if locale_dir == 'en' || !File.directory?(locale_path)

              available_locales << locale_dir
            end
            available_locales.sort
          end

          def validate_and_filter_requested_locales(locale)
            requested_locales = locale.split(',').map(&:strip)
            available_locales = get_all_available_locales
            invalid_locales = requested_locales - available_locales

            if invalid_locales.any?
              log_invalid_locale_warning(invalid_locales, available_locales)
            end

            requested_locales & available_locales
          end

          def get_all_available_locales
            Dir.glob(locales_dir.join('*')).map { |path| File.basename(path) }
          end

          def log_invalid_locale_warning(invalid_locales, available_locales)
            available_except_en = available_locales.reject { |l| l == 'en' }.sort
            cli_log "Invalid locale codes: #{invalid_locales.join(', ')}. " \
                    "Available locales: #{available_except_en.join(', ')}", :warn
          end

          def locales_dir
            @locales_dir ||= Rails.root.join('config/locales')
          end

          def extract_interpolation_args(text)
            return [] unless text.is_a?(String)

            text.scan(/%\{([^}]+)\}/).flatten.uniq
          end

          def extract_html_tags(text)
            return [] unless text.is_a?(String)

            # Extract all HTML tags including self-closing ones
            text.scan(%r{</?[^>]+>}).sort
          end

          def count_line_breaks(text)
            return 0 unless text.is_a?(String)

            # Count all types of line breaks: \n, \r\n, \r
            text.scan(/\r\n|\r|\n/).size
          end

          def validate_line_break_consistency(ref_text, locale_text, current_path)
            ref_line_breaks = count_line_breaks(ref_text)
            locale_line_breaks = count_line_breaks(locale_text)

            return true if ref_line_breaks == locale_line_breaks

            path_str = current_path.join('.')
            cli_log "Line break count mismatch for #{path_str} " \
                    "(#{ref_line_breaks} vs #{locale_line_breaks})", :warn

            false
          end

          def validate_html_consistency(ref_text, locale_text, current_path)
            ref_tags = extract_html_tags(ref_text)
            locale_tags = extract_html_tags(locale_text)

            return true if ref_tags == locale_tags

            if ref_tags.size == locale_tags.size
              missing_tags = ref_tags - locale_tags
              extra_tags = locale_tags - ref_tags

              if missing_tags.any?
                cli_log "Missing HTML tags for #{current_path.join('.')}: #{missing_tags.join(', ')}", :warn
              end

              if extra_tags.any?
                cli_log "Extra HTML tags for #{current_path.join('.')}: #{extra_tags.join(', ')}", :warn
              end
            else
              path_str = current_path.join('.')
              cli_log "HTML tag count mismatch for #{path_str} " \
                      "(#{ref_tags.size} vs #{locale_tags.size})", :warn
            end

            false
          end

          def fix_interpolation_args(interpolation_context)
            ref_value = interpolation_context[:ref_value]
            locale_value = interpolation_context[:locale_value]
            reference_args = interpolation_context[:reference_args]
            locale_args = interpolation_context[:locale_args]
            current_path = interpolation_context[:current_path]
            context = interpolation_context[:context]

            # Check if it's just a variable name mismatch (same count, different names)
            if reference_args.size == locale_args.size && reference_args.sort != locale_args.sort
              # Just fix the variable names without using translation service
              suggested_text = fix_interpolation_variables(locale_value, reference_args)
              suggestion_source = 'Simple Replacement'

              user_choice = prompt_user_for_translation_choice(current_path, ref_value, locale_value, suggested_text,
                                                               suggestion_source)

              case user_choice
                when 'a', 'accept'
                  return suggested_text
                when 's', 'skip'
                  cli_log "Skipping fix for #{current_path.join('.')}", :warn
                  return locale_value
                when 'm', 'manual'
                  manual_translation = prompt_for_manual_translation(current_path)
                  return fix_interpolation_variables(manual_translation, reference_args)
              end
            else
              # Different count or no interpolation args - use translation service
              locale_code = extract_locale_from_context(context)

              begin
                translated_text = translate_text(ref_value, locale_code)
                suggestion_source = @translation_provider.capitalize

                user_choice = prompt_user_for_translation_choice(current_path, ref_value, locale_value,
                                                                 translated_text, suggestion_source)

                case user_choice
                  when 'a', 'accept'
                    return fix_interpolation_variables(translated_text, reference_args)
                  when 's', 'skip'
                    cli_log "Skipping translation for #{current_path.join('.')}", :warn
                    return locale_value
                  when 'm', 'manual'
                    manual_translation = prompt_for_manual_translation(current_path)
                    return fix_interpolation_variables(manual_translation, reference_args)
                end
              rescue StandardError => e
                cli_log "Translation failed for #{current_path.join('.')}: #{e.message}", :error
              end
            end

            # Fallback to original behavior
            fix_interpolation_variables(locale_value, reference_args)
          end

          def fix_interpolation_variables(text, reference_args)
            return text unless text.is_a?(String)

            locale_placeholders = []
            text.scan(/%\{([^}]+)\}/) do |match|
              placeholder = match.first
              start_pos = Regexp.last_match.offset(0).first
              locale_placeholders << [placeholder, start_pos]
            end

            if reference_args.size != locale_placeholders.size
              cli_log 'Cannot fix interpolation arguments: count mismatch ' \
                      "(#{reference_args.size} vs #{locale_placeholders.size})", :warn
              return text
            end

            result = text.dup
            locale_placeholders.each_with_index do |(locale_arg, _pos), index|
              if index < reference_args.size && locale_arg != reference_args[index]
                result.gsub!(/%\{#{Regexp.escape(locale_arg)}\}/, "%{#{reference_args[index]}}")
              end
            end
            result
          end

          def process_hash(locale_hash, reference_hash, path = [], changes = 0)
            return changes unless reference_hash.is_a?(Hash) && locale_hash.is_a?(Hash)

            reference_hash.each do |key, ref_value|
              current_path = path + [key]
              next unless locale_hash.key?(key)

              locale_value = locale_hash[key]
              context = {
                locale_hash: locale_hash,
                key: key,
                ref_value: ref_value,
                locale_value: locale_value,
                current_path: current_path,
                changes: changes
              }
              changes = process_value_pair(context)
            end
            changes
          end

          def process_value_pair(context)
            if both_strings?(context[:ref_value], context[:locale_value])
              process_string_values(context)
            elsif both_hashes?(context[:ref_value], context[:locale_value])
              process_hash(context[:locale_value], context[:ref_value], context[:current_path], context[:changes])
            else
              context[:changes]
            end
          end

          def both_strings?(ref_value, locale_value)
            ref_value.is_a?(String) && locale_value.is_a?(String)
          end

          def both_hashes?(ref_value, locale_value)
            ref_value.is_a?(Hash) && locale_value.is_a?(Hash)
          end

          def process_string_values(context)
            ref_value = context[:ref_value]
            locale_value = context[:locale_value]
            current_path = context[:current_path]
            changes = context[:changes]

            # Check HTML tag consistency if enabled
            if @checks_to_run.include?('html')
              validate_html_consistency(ref_value, locale_value, current_path)
            end

            # Check line break consistency if enabled
            if @checks_to_run.include?('line_break')
              validate_line_break_consistency(ref_value, locale_value, current_path)
            end

            # Check interpolation arguments if enabled
            if @checks_to_run.include?('interpolation')
              reference_args = extract_interpolation_args(ref_value)
              locale_args = extract_interpolation_args(locale_value)

              # Check if there's a mismatch (different arguments or different count)
              has_mismatch = (reference_args.sort != locale_args.sort)
              return changes unless has_mismatch

              if @fix
                interpolation_context = {
                  ref_value: ref_value,
                  locale_value: locale_value,
                  reference_args: reference_args,
                  locale_args: locale_args,
                  current_path: current_path,
                  context: context
                }
                new_value = fix_interpolation_args(interpolation_context)

                return changes if new_value == locale_value

                context[:locale_hash][context[:key]] = new_value
                log_fix(current_path, locale_value, new_value)
                return changes + 1
              else
                # Just report the mismatch without fixing
                path_str = current_path.join('.')
                cli_log "Interpolation argument mismatch for #{path_str} " \
                        "(expected: #{reference_args.join(', ')}, found: #{locale_args.join(', ')})", :warn
              end
            end

            changes
          end

          def log_fix(current_path, old_value, new_value)
            cli_log "Fixed: #{current_path.join('.')}", :success
            cli_log "    From: #{old_value}"
            cli_log "    To:   #{new_value}"
          end

          def process_locale_files
            @files_to_fix.each do |filename|
              process_single_file(filename)
            end
          end

          def process_single_file(filename)
            reference_file = locales_dir.join("en/#{filename}")
            unless File.exist?(reference_file)
              cli_error "Reference file not found: #{reference_file}"
              return
            end

            reference_data = YAML.load_file(reference_file)
            reference_root = reference_data['en']

            process_locale_variants(filename, reference_root)
          end

          def process_locale_variants(filename, reference_root)
            Dir.glob(locales_dir.join("*/#{filename}")).each do |locale_file|
              locale_dir = File.basename(File.dirname(locale_file))
              next if locale_dir == 'en'

              # Skip if this locale is not in the list of locales to process
              next unless @locales_to_process.include?(locale_dir)

              process_locale_file(locale_file, locale_dir, filename, reference_root)
            end
          end

          def process_locale_file(locale_file, locale_dir, filename, reference_root)
            cli_log "\nProcessing: #{locale_dir}/#{filename}"
            begin
              @current_locale = locale_dir # Set current locale for DeepL translation
              locale_data = YAML.load_file(locale_file)
              locale_key = locale_data.keys.first
              locale_root = locale_data[locale_key]
              file_changes = process_hash(locale_root, reference_root)
              @total_changes += file_changes
              @processed_files += 1

              update_locale_file(locale_file, locale_data, file_changes)
            rescue StandardError => e
              cli_log "Processing #{locale_file}: #{e.message}", :error
            ensure
              @current_locale = nil # Reset current locale
            end
          end

          def update_locale_file(locale_file, locale_data, file_changes)
            if file_changes.positive?
              File.write(locale_file, locale_data.to_yaml(line_width: -1))
              cli_log "Successfully processed with #{file_changes} changes", :success
            end
          end

          def extract_locale_from_context(_context)
            # Return the current locale being processed
            @current_locale || 'en'
          end

          def translate_text(text, target_locale)
            # Check if the target locale is supported
            return nil unless supported_locale?(target_locale)

            begin
              # Create instance and call the translation - get return value directly
              translator = TranslateString.new
              translated_text = translator.call(
                string: text,
                target_language: target_locale,
                source_language: 'en',
                preserve_formatting: true,
                translation_provider: @translation_provider,
                no_log: true # Always suppress logs when called from fix_and_report_inconsistencies
              )

              if translated_text && !translated_text.strip.empty?
                return translated_text.strip
              elsif ENV['DEBUG']
                cli_log "Translation returned empty result for text: '#{text[0..50]}#{'...' if text.length > 50}'",
                        :warn
              end
            rescue StandardError => e
              cli_log "Translation failed: #{e.message}", :warn
            end

            nil
          end

          def supported_locale?(locale_code)
            # List of supported locales (matching the translate_string command)
            supported_locales = %w[
              ar bg cs da de el es et fi fr he hu id it ja ko lt lv nb nl pl pt ro ru sk sl sv th tr uk vi zh
              zh-hans zh-hant hr sr
            ]

            supported_locales.include?(locale_code.downcase)
          end

          def prompt_user_for_translation_choice(current_path, english_text, current_text, suggested_text,
                                                 suggestion_source)
            puts "\n#{'=' * 80}"
            puts '🔍 Interpolation argument mismatch found:'
            puts "📍 Path: #{current_path.join('.')}"
            puts "🏴 English text: #{english_text}"
            puts "📝 Current text: #{current_text}"
            puts "🌐 Suggestion (#{suggestion_source}): #{suggested_text}"
            puts '=' * 80
            puts
            puts 'Choose an action:'
            puts '  [a] Accept Suggestion'
            puts '  [s] Skip this key'
            puts '  [m] Manual add translation'
            puts
            print 'Your choice (a/s/m): '

            choice = Readline.readline('', true).to_s.chomp.downcase
            until %w[a s m accept reject manual].include?(choice)
              choice = Readline.readline("Invalid choice. Please enter 'a', 's', or 'm': ", true).to_s.chomp.downcase
            end

            choice
          end

          def prompt_for_manual_translation(current_path)
            puts "\n📝 Enter your manual translation for: #{current_path.join('.')}"
            Readline.readline('Translation: ', true).to_s.chomp
          end
        end
      end
    end
  end
end
