# frozen_string_literal: true

class UsersAssessmentSerializer < ActiveModel::Serializer
  attributes :id, :user_id, :assessment_id
end
