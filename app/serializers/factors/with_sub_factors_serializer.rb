# frozen_string_literal: true

module Factors
  class WithSubFactorsSerializer < Panko::Serializer
    attributes :id, :name, :code, :parent_id, :question_ids, :description, :icon, :alias, :scoring_strategy
    has_many :factors_sub_factors, each_serializer: FactorsSubFactorSerializer

    def icon
      object.icon.url
    end

    def question_ids
      if context[:assessment_id]
        object.questions.where(assessment_id: context[:assessment_id]).ids
      else
        []
      end
    end

    def alias
      return if context[:alias].blank?

      context[:alias][object.id]&.first&.name
    end
  end
end
