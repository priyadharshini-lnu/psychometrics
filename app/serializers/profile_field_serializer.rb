# frozen_string_literal: true

class ProfileFieldSerializer < ActiveModel::Serializer
  attributes :required, :half_size, :position, :name, :question_id, :question, :locked, :translations

  def question
    QuestionSerializer.new(object.question)
  end

  def translations
    Translation.to_hash_for_question(object.question_id, @instance_options[:selected_locale] || 'en')
  end

  def name
    object.question.name
  end
end
