# frozen_string_literal: true

class NominationRequirementSerializer < ActiveModel::Serializer
  attributes :id, :name, :position, :subject_conditions, :conditions
end
