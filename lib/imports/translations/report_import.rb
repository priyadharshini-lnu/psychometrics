module Imports
  module Translations
    class ReportImport < Imports::BaseImport
      attr_accessor :report_id
      validates :report_id, presence: true

      # Authorisation flow
      #
      include Pundit
      ## Prepend :administration namespace to policy
      include Administration::Policies

      validates :file, file_content_type: { allow: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                                                    'application/vnd.ms-excel',
                                                    'text/csv'] }

      AVAILABLE_TRANSLATEABLE_TYPES = %w(reports/filter factor occupation reports/module).freeze

      def process!
        # Return error if form not valid
        return false unless valid?

        imported_items = load_imported_items.compact

        if imported_items.map(&:valid?).all?
          imported_items.each(&:save!)
        else
          imported_items.each do |translation|
            translation.errors.full_messages.each do |message|
              errors.add(:base, I18n.t('administration.imports.errors.translation.error', id: translation.question_id, error: message))
            end
          end
        end

        errors.blank?
      end

      #
      # Parse file
      # Return array of new Users
      #
      def load_imported_items
        # Parse header of xls/csv by strict rules
        rows = open_spreadsheet.parse
        header = rows.shift

        collect_translations = Hash.new

        rows.each do |row|
          data = Hash[header.zip(row)]
          translateable_type, translateable_id, key = data.delete('key').split(':')
          # Are there expected translateable_type
          unless AVAILABLE_TRANSLATEABLE_TYPES.include?(translateable_type)
            errors.add(:base, I18n.t('administration.imports.errors.translation.invalid_format'))
            return [nil]
          end

          collect_translations[translateable_type] ||= {}
          collect_translations[translateable_type][translateable_id] ||= {}

          # Initialize collections of translation
          # Nested hash if not initilized return blank hash insted nil
          data.each do |locale, translation|
            collect_translations[translateable_type][translateable_id][locale] ||= {}
            collect_translations[translateable_type][translateable_id][locale][key] = translation
          end
        end

        translations = []
        collect_translations.each do |translateable_type, resources|
          resources.each do |translateable_id, locales|
            locales.each do |locale, props|
              translation = Translation.find_or_initialize_by({
                translateable_id: translateable_id,
                translateable_type: translateable_type.classify,
                resource_id: report_id,
                resource_type: 'Report',
                locale: locale
              })
              translation.props = props
              translations << translation
            end
          end
        end

        translations
      # Pick up error when header has invalid format
      rescue Roo::HeaderRowNotFoundError
        errors.add(:base, I18n.t('administration.imports.errors.invalid_format'))
        [nil]
      end

      def open_spreadsheet
        case File.extname(file.original_filename)
        when '.csv' then Roo::CSV.new(file.path)
        when '.xlsx' then ::Roo::Excelx.new(file.path)
        else raise t('administration.imports.errors.unknown_type', filename: file.original_filename)
        end
      end
    end
  end
end
