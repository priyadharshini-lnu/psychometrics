# frozen_string_literal: true

class ProfileFieldSerializer < ActiveModel::Serializer
  attributes :required, :half_size, :position, :name, :question_id, :question, :locked

  def question
    QuestionSerializer.new(object.question)
  end

  def name
    object.question.name
  end
end
