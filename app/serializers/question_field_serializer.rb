# frozen_string_literal: true

class QuestionFieldSerializer < ActiveModel::Serializer
  attributes :id, :name, :required_validation
end
