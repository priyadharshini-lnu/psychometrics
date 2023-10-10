# frozen_string_literal: true

class SavilleFactor < ApplicationRecord
  audited

  def self.get_factors(assessment_id)
    SavilleFactor.where(assessment_id: assessment_id).order(:id).each_with_object({}) do |sf, hash|
      hash[sf.factor_id] ||= {
        id: sf.factor_id,
        name: sf.name,
        score_types: {}
      }

      hash[sf.factor_id][:score_types][sf.score_type] ||= []
      hash[sf.factor_id][:score_types][sf.score_type] << sf.value_type
    end.values
  end
end
