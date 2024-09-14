# frozen_string_literal: true

class ProfileFieldSerializer < Panko::Serializer
  attributes :required, :half_size, :position, :name, :question_id, :question, :locked, :translations

  delegate :question, to: :object

  has_one :question, serializer: QuestionSerializer

  def translations
    Translation.to_hash_for_question(object.question_id, context[:selected_locale] || 'en')
  end

  def name
    object.question.name
  end

  class QuestionSerializer < Panko::Serializer
    attributes :type, :props
  end
end
