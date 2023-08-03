# frozen_string_literal: true

module Imports
  module Translations
    class QuestionImport < TranslationImport
      attr_accessor :question_id, :resource_id

      validates :resource_id, presence: true

      include Pundit
      include Administration::Policies

      validates :file, file_content_type: { allow: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                                                    'application/vnd.ms-excel',
                                                    'text/csv',
                                                    'application/octet-stream',
                                                    'text/plain'] }

      def process!
        return false unless valid?

        imported_items = load_imported_items.compact

        extract = imported_items.map(&:locale) & Translation.where(translateable_type: resource_type,
                                                                   translateable_id: resource_id)
        Translation.where(translateable_type: resource_type, translateable_id: resource_id).
          where.not(locale: extract).destroy_all

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
        'Question'
      end

      def assessment
        nil
      end

      private

      def translatable_branches
        %w[question].freeze
      end
    end
  end
end
