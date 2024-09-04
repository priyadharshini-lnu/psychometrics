# frozen_string_literal: true

class NominationRequirementSerializer < Panko::Serializer
  attributes :id, :name, :position, :subject_conditions, :conditions
end
