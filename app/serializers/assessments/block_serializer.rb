# frozen_string_literal: true

module Assessments
  class BlockSerializer < Panko::Serializer
    attributes :id, :name, :position, :deleted, :props, :created_at, :template_id, :questions, :block_type

    def props
      return object.props if default_language?
      return object.props unless translations_migrated?

      translations = context.dig(:translations, 'block', id)

      return object.props unless translations

      Utility::Hash.deep_merge(object.props, (translations['props'] || {}))
    end

    def questions
      Panko::ArraySerializer.new(
        object.questions_ams,
        each_serializer: Assessments::QuestionSerializer,
        context: {
          locale: context[:locale],
          default_language: context[:default_language],
          translations_migrated: context[:translations_migrated],
          translations: context[:translations]
        }
      ).to_a
    end

    def deleted
      !!object.deleted_at
    end

    def created_at
      I18n.l object.created_at, format: :short
    end

    private

    def default_language?
      return true if context.nil?

      context[:default_language] == context[:locale]
    end

    def translations_migrated?
      context[:translations_migrated] || false
    end
  end
end
