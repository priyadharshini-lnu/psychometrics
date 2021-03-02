# frozen_string_literal: true

module Administration
  class AssessorAssessmentSerializer < ActiveModel::Serializer
    attributes :id, :name
  end
end
