# frozen_string_literal: true

module Assessments
  class QuestionSerializer < Panko::Serializer
    attributes :id, :name, :type, :position, :props, :deleted, :created_at,
               :validation, :required_validation, :display_logic, :skip_logic, :template_id, :block_id

    def deleted
      !!object.deleted_at
    end

    def props
      return object.props if default_language?
      return object.props unless translations_migrated?

      return object.props unless translations

      Utility::Hash.deep_merge(object.props, translations['props'] || {})
    end

    def validation
      return object.validation if default_language?

      return object.validation unless translations

      Utility::Hash.deep_merge(object.validation, translations['validation'] || {})
    end

    private

    def translations
      @translations = context.dig(:translations, 'question', id)
    end

    def default_language?
      context[:default_language] == context[:locale]
    end

    def translations_migrated?
      context[:translations_migrated] || false
    end
  end
end
