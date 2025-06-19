# frozen_string_literal: true

module Devtools
  module CLI
    module Commands
      module I18n
        class TranslationChanges < Base
          private_attr_reader :source_branch, :target_branch, :notification_emails, :temp_dirs

          desc 'Check difference between branches in translation files'
          option :source_branch,
                 desc: 'Source branch to compare against',
                 required: true
          option :target_branch,
                 desc: 'Target branch/Current branch to compare',
                 required: true
          option :notification_emails,
                 desc: 'Comma-separated list of email addresses to notify when changes are found',
                 default: nil

          def call(source_branch:, target_branch:, notification_emails: nil, **)
            @source_branch = source_branch
            @target_branch = target_branch
            @notification_emails = notification_emails

            cli_log "\nI18n Key Changes Comparison"
            cli_log "============================\n\n"

            cli_log "Source branch: #{source_branch}"
            cli_log "Target branch: #{target_branch}"

            check_git_available
            @temp_dirs = create_temp_dirs

            begin
              extract_branch_translations(@temp_dirs)

              changes = compare_translation_files(@temp_dirs)
              xlsx_file_path = generate_xlsx_report(changes)

              if xlsx_file_path && notification_emails
                send_email_notification(xlsx_file_path)
              end
            rescue StandardError => e
              cli_error "Error: #{e.message}"
            ensure
              cleanup_temp_dirs(@temp_dirs)
            end
          end

          private

          def check_git_available
            return if system('which git > /dev/null')

            cli_error 'Error: git not found in PATH'
          end

          def create_temp_dirs
            {
              source: Dir.mktmpdir("source-#{current_time_stamp}"),
              target: Dir.mktmpdir("target-#{current_time_stamp}")
            }
          end

          def extract_branch_translations(temp_dirs)
            cli_log "\nExtracting translation files from branches..."
            extract_single_branch(source_branch, temp_dirs[:source], 'source branch')
            extract_single_branch(target_branch, temp_dirs[:target], 'target branch')
          end

          def extract_single_branch(branch, temp_dir, branch_desc)
            # Validate branch name to prevent command injection
            unless branch_name_valid?(branch)
              cli_error "Error: Invalid #{branch_desc} name '#{branch}"
            end

            branch_escaped = "origin/#{Shellwords.escape(branch)}"
            temp_dir_escaped = Shellwords.escape(temp_dir)
            system("git archive --format=tar #{branch_escaped} config/locales | tar -x -C #{temp_dir_escaped}")
          end

          def branch_name_valid?(branch)
            # Only allow alphanumeric characters, dash, underscore, period, and slash (common in Git branch names)
            %r{\A[\w.\-/]+\z}.match?(branch)
          end

          def compare_translation_files(temp_dirs)
            # We'll still use English as our base language for comparison
            source_files = Dir.glob("#{temp_dirs[:source]}/config/locales/en/**/*.yml")
            target_files = Dir.glob("#{temp_dirs[:target]}/config/locales/en/**/*.yml")

            if source_files.empty? || target_files.empty?
              cli_error 'Error: No translation files found in one of the branches.'
            end

            all_files = get_all_translation_files(source_files, target_files, temp_dirs)

            changes = []
            all_files.each do |file|
              source_file = "#{temp_dirs[:source]}/config/locales/en/#{file}"
              target_file = "#{temp_dirs[:target]}/config/locales/en/#{file}"

              source_data = load_yaml_file(source_file)
              target_data = load_yaml_file(target_file)

              collect_changes(source_data, target_data, file, changes)
            end

            changes
          end

          def get_all_translation_files(source_files, target_files, temp_dirs)
            source_prefix = "#{temp_dirs[:source]}/config/locales/en/"
            target_prefix = "#{temp_dirs[:target]}/config/locales/en/"

            (source_files.map { |f| f.gsub(source_prefix, '') } +
             target_files.map { |f| f.gsub(target_prefix, '') }).uniq
          end

          def load_yaml_file(file_path)
            File.exist?(file_path) ? YAML.load_file(file_path) : {}
          end

          def collect_changes(source_data, target_data, file, changes)
            source_keys = flatten_hash(source_data).keys
            target_keys = flatten_hash(target_data).keys

            added_keys = source_keys - target_keys
            deleted_keys = target_keys - source_keys
            common_keys = source_keys & target_keys

            updated_keys = find_updated_keys(common_keys, source_data, target_data)

            collect_added_keys(added_keys, source_data, file, changes)
            collect_updated_keys(updated_keys, source_data, target_data, file, changes)
            collect_deleted_keys(deleted_keys, target_data, file, changes)
          end

          def find_updated_keys(common_keys, source_data, target_data)
            common_keys.reject do |key|
              flatten_hash(source_data)[key] == flatten_hash(target_data)[key]
            end
          end

          def collect_added_keys(added_keys, source_data, file, changes)
            added_keys.each do |key|
              changes << {
                file_name: file,
                key: key,
                new_value: flatten_hash(source_data)[key],
                old_value: nil,
                action: 'newly_added'
              }
            end
          end

          def collect_updated_keys(updated_keys, source_data, target_data, file, changes)
            updated_keys.each do |key|
              changes << {
                file_name: file,
                key: key,
                new_value: flatten_hash(source_data)[key],
                old_value: flatten_hash(target_data)[key],
                action: 'updated'
              }
            end
          end

          def collect_deleted_keys(deleted_keys, target_data, file, changes)
            deleted_keys.each do |key|
              changes << {
                file_name: file,
                key: key,
                new_value: nil,
                old_value: flatten_hash(target_data)[key],
                action: 'deleted'
              }
            end
          end

          def generate_xlsx_report(changes)
            cli_log "\nChanges found: #{changes.size}"

            # Generate Excel file only if changes were found
            if changes.empty?
              cli_log 'No changes found between branches. Excel report not generated.'
              return nil
            end

            tmp_dir = File.join('/tmp', 'i18n_changes')
            FileUtils.mkdir_p(tmp_dir)

            src_branch_sanitized = @source_branch.tr('/', '-')
            trg_branch_sanitized = @target_branch.tr('/', '-')

            xlsx_filename = "i18n_Changes_from_#{src_branch_sanitized}_to_#{trg_branch_sanitized}_#{current_time_stamp}.xlsx" # rubocop:disable Lint/LineLength
            xlsx_file = File.join(tmp_dir, xlsx_filename)

            cli_log 'Generating Excel report...'

            write_xlsx_file(xlsx_file, changes)

            cli_log "Excel report generated: #{File.expand_path(xlsx_file)}"
            xlsx_file
          end

          def write_xlsx_file(xlsx_file, changes)
            workbook = FastExcel.open(xlsx_file, constant_memory: true)
            worksheet = workbook.add_worksheet('Translation Changes')

            # Get available locales using the existing temp directories
            locales = get_available_locales(@temp_dirs)

            headers = ['File Name', 'Key', 'Action', 'Old English Value', 'English / en']

            locales.each do |locale|
              headers << locale_display_name(locale)
            end

            header_style = workbook.bold_format
            worksheet.append_row(headers, header_style)

            changes.each do |change|
              key_without_locale = remove_top_level_prefix(change[:key])
              row = [
                change[:file_name],
                key_without_locale,
                change[:action],
                change[:old_value],
                change[:new_value]
              ]

              locales.each do |locale|
                next if locale == 'en' # Skip English as it's already in there

                translation = nil
                if change[:key]
                  # Use source branch for getting other locale translations
                  file_path = "#{@temp_dirs[:source]}/config/locales/#{locale}/#{change[:file_name]}"
                  if File.exist?(file_path)
                    yaml_data = load_yaml_file(file_path)
                    translation = flatten_hash(yaml_data)["#{locale}.#{key_without_locale}"]
                  end
                end

                row << translation
              end

              worksheet.append_row(row)
            end

            workbook.close
          end

          def cleanup_temp_dirs(temp_dirs)
            temp_dirs.each_value do |dir|
              FileUtils.rm_rf(dir)
            end
          end

          def send_email_notification(xlsx_file_path)
            return unless notification_emails && File.exist?(xlsx_file_path)

            subject = "Translation Changes Detected: #{target_branch} to #{source_branch}"
            text_body = <<-TXT
              Please check the attached Excel file for all translation changes.
              Correct the translation in the excel if there are issues with translation and pass this file to tech team.
            TXT

            email_command = Devtools::CLI::Commands::SendEmail.new
            email_command.call(
              to_emails: notification_emails,
              subject: subject,
              text_body: text_body,
              attachment_path: xlsx_file_path
            )
          end

          # Convert nested hash to flat hash with dot notation for keys
          def flatten_hash(hash, prefix = '')
            result = {}

            hash.each do |key, value|
              current_key = prefix.empty? ? key.to_s : "#{prefix}.#{key}"

              if value.is_a?(Hash)
                result.merge!(flatten_hash(value, current_key))
              else
                result[current_key] = value
              end
            end
            result
          end

          def remove_top_level_prefix(string)
            parts = string.split('.')
            if parts.size > 1
              parts[1..].join('.')
            else
              string
            end
          end

          def get_available_locales(temp_dirs)
            # Get all locale directories from both source and target branches
            source_locales = Dir.glob("#{temp_dirs[:source]}/config/locales/*").select do |path|
              File.directory?(path) && File.basename(path) != '.' && File.basename(path) != '..'
            end.map { |path| File.basename(path) }

            target_locales = Dir.glob("#{temp_dirs[:target]}/config/locales/*").select do |path|
              File.directory?(path) && File.basename(path) != '.' && File.basename(path) != '..'
            end.map { |path| File.basename(path) }

            # Combine and remove duplicates
            (source_locales + target_locales).uniq - ['en']
          end

          def locale_display_name(locale)
            # This method returns a formatted locale name like "English / en"
            language_name = ::I18n.t("languages.#{locale}", default: locale.capitalize)
            "#{language_name} / #{locale}"
          end
        end
      end
    end
  end
end
