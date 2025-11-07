# frozen_string_literal: true

if Object.const_defined?('I18n::Tasks')
  require 'i18n/tasks/scanners/file_scanner'
  require 'byebug'

  class CustomJsTsxScanner < I18n::Tasks::Scanners::FileScanner
    include I18n::Tasks::Scanners::RelativeKeys
    include I18n::Tasks::Scanners::OccurrenceFromPosition

    I18n.load_path += Dir.glob('config/locales/**/*.{rb,yml}')

    # @return [Array<[absolute key, I18n::Tasks::Scanners::Results::Occurrence]>]
    def scan_file(path)
      text = read_file(path)

      regex = /
                [I18n|Store]\.t\(
                  \s*
                  (?:
                    `([^`]+?)` |
                    '([^']+?)'
                  )
                  \s*
                  (?:
                    ,\s*[^)]*
                  )?
                \) |
                \{I18nStore\.t\('([^']+?)'\)\} |
                \bI18n\(\)\.t\(
                  \s*
                  (?:
                    `([^`]+?)` |
                    '([^']+?)'
                  )
                  \s*
                  (?:
                    ,\s*[^)]*
                  )?
                \) |
                \bI18n\.lookup\(
                  \s*
                  (?:
                    `([^`]+?)` |
                    '([^']+?)'
                  )
                  \s*
                \)
            /x

      keys = text.scan(regex).flatten.compact

      keys.flat_map do |key|
        occurrence = occurrence_from_position(path, text, text.index(key))

        parent_key = if key.include?('$')
                       key[/.*?(?=\.[$]\{)/] || key[/.*(?=\.[^.]*_\$\{)/]
                     else
                       key
                     end

        parent_value = I18n.t(parent_key, default: {})

        if parent_value.is_a?(Hash)
          traverse_child_keys(parent_key, parent_value, occurrence)
        else
          [[parent_key, occurrence]]
        end
      end
    end

    private

    def traverse_child_keys(parent_key, parent_hash, occurrence)
      parent_hash.flat_map do |child_key, child_value|
        absolute_key = "#{parent_key}.#{child_key}"
        if child_value.is_a?(Hash)
          traverse_child_keys(absolute_key, child_value, occurrence)
        else
          [[absolute_key, occurrence]]
        end
      end
    end
  end

  I18n::Tasks.add_scanner 'CustomJsTsxScanner', only: %w[*.js *.jsx *.ts *.tsx]
else
  # rubocop:disable Lint/EmptyClass
  class CustomJsTsxScanner
  end
  # rubocop:enable Lint/EmptyClass
end
