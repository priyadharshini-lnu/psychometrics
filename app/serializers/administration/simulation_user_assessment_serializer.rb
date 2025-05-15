# frozen_string_literal: true

module Administration
  class SimulationUserAssessmentSerializer < Panko::Serializer
    attributes :time_extension, :content_variation_id, :participant_id
  end
end
