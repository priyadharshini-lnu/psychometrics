# frozen_string_literal: true

class Api::V2::Administration::ProfileFieldResource < Api::V2::Administration::BaseResource
  attributes :required, :half_size, :position, :question, :name

  def question
    QuestionFieldSerializer.new(@model.question).to_h
  end

  def name
    @model.question.name
  end
end
