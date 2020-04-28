# frozen_string_literal: true

module Imports
  module Translations
    class AssessmentImport < Imports::BaseImport
      TRANSLATABLE_BRANCHES = %w[block question].freeze

      attr_accessor :assessment_id
      validates :assessment_id, presence: true

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

      def process!
        # Return error if form not valid
        return false unless valid?

        imported_items = load_imported_items.compact

        extract = imported_items.map(&:locale) & Translation.available_translation_for_assessment(assessment_id)
        Translation.for_assessment(assessment_id).where.not(locale: extract).destroy_all

        if imported_items.map(&:valid?).all?
          imported_items.each(&:save!)
        else
          imported_items.each do |translation|
            translation.errors.full_messages.each do |message|
              errors.add(:base, I18n.t('administration.imports.errors.translation.error',
                                       id: translation.translateable_id, error: message))
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
        rows = open_spreadsheet.to_a
        header = rows.shift
        collect_translations = {}
        rows.each do |row|
          data = Hash[header.zip(row)]
          branch_type, id, key = data.delete('Key').split(':')
          collect_translations[branch_type] ||= {}
          collect_translations[branch_type][id] ||= {}
          data.each do |locale, translation|
            locale = locale.split(' / ').last
            next if locale == 'en' || translation.blank? # Default locale or not translated

            collect_translations[branch_type][id][locale] ||= {}
            collect_translations[branch_type][id][locale][key] = translation
          end
        end

        translations = []
        assessment = Assessment.find(assessment_id)
        TRANSLATABLE_BRANCHES.each do |branch|
          collect_translations[branch]&.each do |id, locales|
            # If can't find question/block for specified assessment, then add error
            unless assessment.public_send(branch.pluralize).where(id: id).exists?
              errors.add(:base, I18n.t('administration.imports.errors.translation.error',
                                       id: id, error: "Can't find #{branch}")) && next
            end

            locales.each do |locale, props|
              translation = Translation.find_or_initialize_by(
                translateable_id: id,
                translateable_type: branch.capitalize,
                resource_id: assessment_id,
                resource_type: Assessment::TYPES[:common],
                locale: locale
              )
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
