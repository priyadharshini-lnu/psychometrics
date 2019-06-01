# frozen_string_literal: true

class NominationRequirementSerializer < ActiveModel::Serializer
  attributes :id, :name,:subject_conditions, :conditions
end
