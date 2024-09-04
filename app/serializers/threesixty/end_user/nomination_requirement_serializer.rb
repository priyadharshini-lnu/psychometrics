# frozen_string_literal: true

module Threesixty::EndUser
  class NominationRequirementSerializer < Panko::Serializer
    attributes :id, :name, :position, :subject_conditions, :conditions
  end
end
