# frozen_string_literal: true

class FactorsScoringSerializer < Panko::Serializer
  attributes :id, :props, :question_id, :ai_scoring_config
end
