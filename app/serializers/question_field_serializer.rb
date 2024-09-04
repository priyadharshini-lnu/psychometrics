# frozen_string_literal: true

class QuestionFieldSerializer < Panko::Serializer
  attributes :id, :name, :required_validation
end
