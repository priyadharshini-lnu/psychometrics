# frozen_string_literal: true

module Imports
  module Translations
    class AssessmentImport < TranslationImport
      attr_accessor :resource_id

      validates :resource_id, presence: true

      include Pundit
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

        extract = imported_items.map(&:locale) & Translation.available_translation_for_assessment(resource_id)
        Translation.for_assessment(resource_id).where.not(locale: extract).destroy_all

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

      def resource_type
        Assessment::TYPES[:common]
      end

      def assessment
        Assessment.find(resource_id)
      end

      def translatable_branches
        %w[block question instructions].freeze
      end
    end
  end
end
