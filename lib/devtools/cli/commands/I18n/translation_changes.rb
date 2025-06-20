# frozen_string_literal: true

module Devtools
  module CLI
    module Commands
      module I18n
        class TranslationChanges < Base
          private_attr_reader :source_branch, :target_branch, :notification_emails, :temp_dirs, :source, :folder_path

          desc 'Check difference between branches in translation files'
          option :source,
                 desc: 'Source type to compare (branch or folder)',
                 default: 'branch',
                 enum: %w[branch folder]
          option :source_branch,
                 desc: 'Source branch to compare against (required when source is branch)',
                 required: false
          option :folder_path,
                 desc: 'Path to folder containing translation files (required when source is folder)',
                 required: false
          option :target_branch,
                 desc: 'Target branch/Current branch to compare',
                 required: true
          option :notification_emails,
                 desc: 'Comma-separated list of email addresses to notify when changes are found',
                 default: nil

          def call(target_branch:, source: 'branch', source_branch: nil, folder_path: nil, notification_emails: nil, **) # rubocop:disable Metrics/ParameterLists
            @source = source
            @source_branch = source_branch
            @target_branch = target_branch
            @folder_path = folder_path
            @notification_emails = notification_emails

            display_header
            validate_source_parameters
            display_source_target_info

            check_git_available
            @temp_dirs = create_temp_dirs

            begin
              extract_translations(@temp_dirs)

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

          def display_header
            cli_log "\nI18n Key Changes Comparison"
            cli_log "============================\n\n"
          end

          def validate_source_parameters
            validate_source_type

            if @source == 'branch'
              validate_source_branch
            else
              validate_folder_path
            end
          end

          def validate_source_type
            return if %w[branch folder].include?(@source)

            cli_error "Error: Invalid source option '#{@source}'. Must be 'branch' or 'folder'."
          end

          def validate_source_branch
            return if @source_branch

            cli_error "Error: source_branch is required when source is set to 'branch'"
          end

          def validate_folder_path
            unless @folder_path
              cli_error "Error: folder_path is required when source is set to 'folder'"
            end

            unless File.directory?(@folder_path)
              cli_error "Error: folder path '#{@folder_path}' does not exist or is not a directory"
            end
          end

          def display_source_target_info
            if @source == 'branch'
              cli_log "Source branch: #{source_branch}"
            else
              cli_log "Source folder: #{folder_path}"
            end

            cli_log "Target branch: #{target_branch}"
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

          def extract_translations(temp_dirs)
            cli_log "\nExtracting translation files..."

            extract_source_files(temp_dirs[:source])
            extract_target_files(temp_dirs[:target])
          end

          def extract_source_files(temp_dir)
            if @source == 'branch'
              extract_single_branch(source_branch, temp_dir, 'source branch')
            else
              extract_from_folder(folder_path, temp_dir)
            end
          end

          def extract_target_files(temp_dir)
            # Target files always come from a branch
            extract_single_branch(target_branch, temp_dir, 'target branch')
          end

          def extract_from_folder(source_folder, temp_dir)
            # Double-check folder existence
            unless Dir.exist?(source_folder)
              cli_error "Error: Source folder '#{source_folder}' does not exist"
            end

            # Check if the folder has config/locales
            locales_path = File.join(source_folder, 'config/locales')
            unless Dir.exist?(locales_path)
              cli_error "Error: config/locales directory not found in '#{source_folder}'"
            end

            # Create needed directories and copy files
            FileUtils.mkdir_p(File.join(temp_dir, 'config'))
            FileUtils.cp_r(locales_path, File.join(temp_dir, 'config/'))
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
            source_files = get_translation_files(temp_dirs[:source])
            target_files = get_translation_files(temp_dirs[:target])

            validate_translation_files(source_files, target_files)
            all_files = get_all_translation_files(source_files, target_files, temp_dirs)

            collect_all_changes(all_files, temp_dirs)
          end

          def get_translation_files(temp_dir)
            Dir.glob("#{temp_dir}/config/locales/en/**/*.yml")
          end

          def validate_translation_files(source_files, target_files)
            if source_files.empty? || target_files.empty?
              cli_error 'Error: No translation files found in one of the branches.'
            end
          end

          def collect_all_changes(all_files, temp_dirs)
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
            flattened_source = flatten_hash(source_data)
            flattened_target = flatten_hash(target_data)

            source_keys = flattened_source.keys
            target_keys = flattened_target.keys

            # Analyze the differences
            key_differences = analyze_key_differences(source_keys, target_keys)

            # Find updated keys among common keys
            updated_keys = find_updated_keys(key_differences[:common], source_data, target_data)

            # Collect changes by type
            collect_added_keys(key_differences[:added], source_data, file, changes)
            collect_updated_keys(updated_keys, source_data, target_data, file, changes)
            collect_deleted_keys(key_differences[:deleted], target_data, file, changes)
          end

          def analyze_key_differences(source_keys, target_keys)
            added_keys = source_keys - target_keys
            deleted_keys = target_keys - source_keys
            common_keys = source_keys & target_keys

            {
              added: added_keys,
              deleted: deleted_keys,
              common: common_keys
            }
          end

          def find_updated_keys(common_keys, source_data, target_data)
            # Compare values for common keys to find those that have changed
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

            # Prepare output directory
            tmp_dir = prepare_output_directory

            # Generate filename based on source and target
            xlsx_filename = generate_xlsx_filename
            xlsx_file = File.join(tmp_dir, xlsx_filename)

            cli_log 'Generating Excel report...'
            write_xlsx_file(xlsx_file, changes)

            cli_log "Excel report generated: #{File.expand_path(xlsx_file)}"
            xlsx_file
          end

          def prepare_output_directory
            tmp_dir = File.join('/tmp', 'i18n_changes')
            FileUtils.mkdir_p(tmp_dir)
            tmp_dir
          end

          def generate_xlsx_filename
            target_branch_sanitized = @target_branch.tr('/', '-')
            source_desc = get_source_description_for_filename

            "i18n_Changes_from_#{source_desc}_to_#{target_branch_sanitized}_#{current_time_stamp}.xlsx"
          end

          def get_source_description_for_filename
            if @source == 'branch'
              source_sanitized = @source_branch.tr('/', '-')
              "branch-#{source_sanitized}"
            else
              folder_basename = File.basename(@folder_path).tr('/', '-').gsub(/[^0-9A-Za-z\-]/, '_')
              "folder-#{folder_basename}"
            end
          end

          def write_xlsx_file(xlsx_file, changes)
            workbook = FastExcel.open(xlsx_file, constant_memory: true)
            worksheet = workbook.add_worksheet('Translation Changes')

            # Get available locales using the existing temp directories
            locales = get_available_locales(@temp_dirs)

            add_xlsx_headers(worksheet, workbook, locales)
            add_xlsx_data_rows(worksheet, changes, locales)
            workbook.close
          end

          def add_xlsx_headers(worksheet, workbook, locales)
            headers = ['File Name', 'Key', 'Action', 'Old English Value', 'English / en']

            locales.each do |locale|
              headers << locale_display_name(locale)
            end

            header_style = workbook.bold_format
            worksheet.append_row(headers, header_style)
          end

          def add_xlsx_data_rows(worksheet, changes, locales)
            changes.each do |change|
              row = build_xlsx_row(change, locales)
              worksheet.append_row(row)
            end
          end

          def build_xlsx_row(change, locales)
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

              row << get_translation_for_locale(locale, change[:file_name], key_without_locale, change[:key])
            end

            row
          end

          def get_translation_for_locale(locale, file_name, key_without_locale, original_key)
            return nil unless original_key

            # Use source branch for getting other locale translations
            file_path = "#{@temp_dirs[:source]}/config/locales/#{locale}/#{file_name}"
            if File.exist?(file_path)
              yaml_data = load_yaml_file(file_path)
              return flatten_hash(yaml_data)["#{locale}.#{key_without_locale}"]
            end

            nil
          end

          def cleanup_temp_dirs(temp_dirs)
            temp_dirs.each_value do |dir|
              FileUtils.rm_rf(dir)
            end
          end

          def send_email_notification(xlsx_file_path)
            return unless notification_emails && File.exist?(xlsx_file_path)

            subject = generate_email_subject
            text_body = generate_email_body

            send_email(subject, text_body, xlsx_file_path)
          end

          def generate_email_subject
            source_desc = get_source_description_for_email
            "Translation Changes Detected: #{source_desc} to #{target_branch}"
          end

          def get_source_description_for_email
            @source == 'branch' ? "branch #{source_branch}" : "folder #{folder_path}"
          end

          def generate_email_body
            <<-TXT
              Please check the attached Excel file for all translation changes.
              Correct the translation in the excel if there are issues with translation and pass this file to tech team.
            TXT
          end

          def send_email(subject, text_body, attachment_path)
            email_command = Devtools::CLI::Commands::SendEmail.new
            email_command.call(
              to_emails: notification_emails,
              subject: subject,
              text_body: text_body,
              attachment_path: attachment_path
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
