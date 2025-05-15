# frozen_string_literal: true

module Administration
  class PearsonUserAssessmentSerializer < Panko::Serializer
    attributes :schedule_id, :norm_id
  end
end
