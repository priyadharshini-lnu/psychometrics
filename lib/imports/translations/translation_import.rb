# frozen_string_literal: true

module Imports
  module Translations
    class TranslationImport < Imports::BaseImport
      attr_accessor :resource_id

      validates :resource_id, presence: true

      # Authorisation flow
      #
      include Pundit
      ## Prepend :administration namespace to policy
      include Administration::Policies

      validates :file, file_content_type: { allow: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                                                    'application/vnd.ms-excel',
                                                    'text/csv',
                                                    'application/octet-stream',
                                                    'text/plain'] }

      # rubocop:disable Metrics/CyclomaticComplexity
      # rubocop:disable Metrics/PerceivedComplexity
      # rubocop:disable Metrics/AbcSize
      # rubocop:disable Metrics/BlockLength
      def load_imported_items
        # Parse header of xls/csv by strict rules
        rows = open_spreadsheet.to_a
        header = rows.shift
        collect_translations = {}
        rows.each do |row|
          row.map! { |value| Utility::String.remove_csv_injection_marker(value) }
          data = header.zip(row).to_h
          branch_type, id, key = data.delete('Key').split(':')
          collect_translations[branch_type] ||= {}
          collect_translations[branch_type][id] ||= {}
          data.each do |locale, translation|
            locale = locale.split(' / ').last
            next if locale == default_locale || translation.blank? # Default locale or not translated

            collect_translations[branch_type][id][locale] ||= {}
            collect_translations[branch_type][id][locale][key] = translation
          end
        end

        translations = []
        translatable_branches.each do |branch|
          collect_translations[branch]&.each do |id, locales|
            # If can't find question/block for specified assessment, then add error
            if assessment && branch != 'instructions' && !assessment.public_send(branch.pluralize).exists?(id: id)
              errors.add(:base, I18n.t('administration.imports.errors.translation.error',
                                       id: id, error: "Can't find #{branch}")) && next
            end

            locales.each do |locale, props|
              translation = Translation.find_or_initialize_by(
                translateable_id: id,
                translateable_type: branch.capitalize,
                resource_id: resource_id,
                resource_type: resource_type,
                locale: locale
              )

              if assessment&.translations_migrated?
                default_props = if branch == 'instructions'
                                  assessment.instructions
                                else
                                  default_props(branch, id)
                                end

                translated_props = replace_props_with_translations(default_props[:props], default_props[:validation],
                                                                   props)
                translation.data = translated_props
              else
                translation.props = props
              end

              translations << translation
            end
          end
        end

        translations
      rescue Roo::HeaderRowNotFoundError
        errors.add(:base, I18n.t('administration.imports.errors.invalid_format'))
        [nil]
      end
      # rubocop:enable all

      def open_spreadsheet
        if file.is_a?(ActionDispatch::Http::UploadedFile)
          file_name = file.original_filename
          file_location = file.path
        else
          file_name = file.filename.to_s
          file_location = file.url
        end

        case File.extname(file_name)
          when '.csv' then Roo::CSV.new(file_location)
          when '.xlsx' then ::Roo::Excelx.new(file_location)
          else raise t('administration.imports.errors.unknown_type', filename: file_name)
        end
      end

      private

      def default_locale
        @default_locale ||= resource_type == Assessment::TYPES[:common] ? assessment.default_language : 'en'
      end

      def translatable_branches
        raise NotImplementedError
      end

      def default_props(branch, id)
        resource = branch.capitalize.constantize.find(id)

        {
          props: resource.props,
          validation: resource.respond_to?(:validation) ? resource.validation : {}
        }
      end

      def replace_props_with_translations(question_props, validations, translated_props)
        filterd_question_props = Builders::Translations::TranslationBuilder.
                                 new(question_props).
                                 filter_allowed_props

        filterd_validations = Builders::Translations::TranslationBuilder.new(validations).filter_allowed_props

        translated_props.map do |k, v|
          JsonPath.for(filterd_question_props).gsub!(k) { |_vv| v }.to_hash
          JsonPath.for(filterd_validations).gsub!(k) { |_vv| v }.to_hash
        end

        {
          props: filterd_question_props,
          validation: filterd_validations
        }
      end
    end
  end
end
