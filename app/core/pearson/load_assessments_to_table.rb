# frozen_string_literal: true

module Pearson
  class LoadAssessmentsToTable < Base
    def call
      pearson_assessents = Pearson::GetAssessments.call!.map do |a|
        PearsonAssessment.new(
          product_id: a['productId'], title: a['title'], norms: a['norms'], languages: a['languages']
        )
      end
      PearsonAssessment.delete_all
      PearsonAssessment.import pearson_assessents
    end
  end
end
