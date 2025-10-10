# frozen_string_literal: true

module Devtools
  module CLI
    module Commands
      module I18n
        class AutoTranslateYml < Base
          desc <<-DESC
            Automatically translate all new keys added, updated and deleted in english language to all other languages.
          DESC
          option :base_branch,
                 desc: 'Base branch to compare against for finding new translations',
                 required: true,
                 alias: :b
          option :remove_temp_files,
                 type: :boolean,
                 default: false,
                 desc: 'Remove temporary files after processing (default: false)',
                 alias: :rtf

          def call(base_branch:, remove_temp_files: false, **)
            @base_branch = base_branch
            @temp_files = {}

            display_header
            validate_git_available

            begin
              changes_file = run_translation_changes

              if changes_file
                translated_file = run_auto_translate_xlsx(changes_file)
                if translated_file
                  import_translations(translated_file)
                  display_success_message
                end
              else
                cli_log 'No changes found. Nothing to translate.'
              end
            rescue StandardError => e
              cli_error "Error during YML auto-translation process: #{e.message}"
              cli_error e.backtrace.join("\n") if ENV['DEBUG']
            ensure
              cleanup_temp_files if remove_temp_files
            end
          end

          private

          def display_header
            cli_log "\nAutomatic YAML Translation"
            cli_log "========================\n"
            cli_log "Base branch: #{@base_branch}"
            cli_log "Current directory: #{Dir.pwd}"
          end

          def validate_git_available
            unless system('which git > /dev/null')
              cli_error 'Error: git command not found. Please ensure git is installed.'
            end
          end

          # Step 1: Run translation_changes to find new translations
          def run_translation_changes
            cli_log "\n\nStep 1: Finding translation changes..."
            changes_output = File.join(tmp_dir, "translation_changes_#{current_time_stamp}.xlsx")
            @temp_files[:changes] = changes_output

            changes_cmd = Devtools::CLI::Commands::I18n::TranslationChanges.new
            begin
              changes_cmd.call(
                source: 'folder',
                folder_path: Dir.pwd,
                target_branch: @base_branch,
                output_file: changes_output
              )

              if File.exist?(changes_output) && !File.empty?(changes_output)
                changes_output
              else
                cli_log 'No translation changes found.'
                nil
              end
            rescue StandardError => e
              cli_error "Error finding translation changes: #{e.message}"
              nil
            end
          end

          # Step 2: Run auto_translate_xlsx to translate new strings
          def run_auto_translate_xlsx(changes_file)
            cli_log "\n\nStep 2: Translating new strings with AI..."
            translated_output = File.join(tmp_dir, "auto_translated_#{current_time_stamp}.xlsx")
            @temp_files[:translated] = translated_output

            translate_cmd = Devtools::CLI::Commands::I18n::AutoTranslateXlsx.new
            begin
              translate_cmd.call(
                file_path: changes_file,
                skip_if_exist: false, # Translate everything
                output_file: translated_output
              )

              if File.exist?(translated_output) && !File.empty?(translated_output)
                translated_output
              else
                cli_log 'Translation process did not produce a valid file.'
                nil
              end
            rescue StandardError => e
              cli_error "Error translating strings: #{e.message}"
              nil
            end
          end

          # Step 3: Import the translated strings back to YAML files
          def import_translations(translated_file)
            cli_log "\n\nStep 3: Importing translations into YAML files..."

            import_cmd = Devtools::CLI::Commands::I18n::TranslationImport.new
            begin
              import_cmd.call(
                file_path: translated_file
              )

              true
            rescue StandardError => e
              cli_error "Error importing translations: #{e.message}"
              false
            end
          end

          def display_success_message
            cli_log 'All auto translated string have been added to the appropriate YAML files.'
          end

          def tmp_dir
            @tmp_dir ||= begin
              dir = File.join(Dir.tmpdir, "devtools_auto_translate_#{current_time_stamp}")
              FileUtils.mkdir_p(dir)
              dir
            end
          end

          def cleanup_temp_files
            @temp_files.each_value do |file|
              FileUtils.rm_f(file)
            end

            FileUtils.rmdir(@tmp_dir) if @tmp_dir && Dir.exist?(@tmp_dir) && Dir.empty?(@tmp_dir)
          rescue StandardError => e
            cli_log "Warning: Could not clean up temporary files: #{e.message}"
          end
        end
      end
    end
  end
end
