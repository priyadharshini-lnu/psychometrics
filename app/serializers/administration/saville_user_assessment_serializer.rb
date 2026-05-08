# frozen_string_literal: true

module Administration
  class SavilleUserAssessmentSerializer < Panko::Serializer
    attributes :data_seprator, :candidate_id, :request_id, :norm_id, :error_code
  end
end
