# frozen_string_literal: true

module Devtools
  module CLI
    module Commands
      module I18n
        class ExportToXlsx < ::Dry::CLI::Command
          desc 'Export translations from YAML to XLSX. File generated from this command can be imported in POE editor.'

          option :lang, required: true, desc: 'Comma-separated list of languages to export (e.g., en,th)'

          def call(lang:, **) # rubocop:disable Metrics/PerceivedComplexity,Metrics/CyclomaticComplexity
            langs = lang.split(',').map(&:strip)
            files_by_lang = {}
            langs.each do |l|
              dir = File.join('config', 'locales', l)
              files_by_lang[l] = Dir.glob(File.join(dir, '*.yml'))
            end

            translations = {}

            langs.each do |l|
              files_by_lang[l].each do |file|
                yaml = YAML.load_file(file)
                locale_root = yaml[l] || yaml.values.first
                flatten_keys(locale_root).each do |row|
                  key = row[:key]
                  context = row[:context]
                  next if key.nil? || context.nil?

                  translations[[key, context]] ||= { 'key' => key, 'context' => context }
                  translations[[key, context]][l] = row[:string].to_s
                end
              end
            end

            xlsx_path = "translations_#{langs.join('_')}.xlsx"
            FileUtils.rm_f(xlsx_path)
            workbook = FastExcel.open(xlsx_path, constant_memory: true)
            worksheet = workbook.add_worksheet('Translations')
            header = %w[key context] + langs
            worksheet.append_row(header)
            translations.each_value do |row|
              worksheet.append_row(header.map { |h| row[h] || '' })
            end
            workbook.close
            puts "Exported #{translations.size} rows to #{xlsx_path}"
          end

          private

          def flatten_keys(hash, parent_keys = [])
            result = []
            hash.each do |k, v|
              if v.is_a?(Hash)
                result += flatten_keys(v, parent_keys + [k])
              else
                context_str = parent_keys.join('.')
                context_str = %("#{context_str}") unless context_str.empty?
                result << {
                  key: k.to_s,
                  context: context_str,
                  string: v.to_s
                }
              end
            end
            result
          end
        end
      end
    end
  end
end
