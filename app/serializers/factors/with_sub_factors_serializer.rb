# frozen_string_literal: true

module Factors
  class WithSubFactorsSerializer < ActiveModel::Serializer
    type :factor
    attributes :id, :name, :code, :parent_id, :question_ids, :description, :icon, :alias, :scoring_strategy
    has_many :factors_sub_factors, serializer: FactorsSubFactorSerializer

    def icon
      object.icon.url
    end

    def question_ids
      if @instance_options[:assessment_id]
        object.questions.where(assessment_id: @instance_options[:assessment_id]).ids
      else
        []
      end
    end

    def alias
      @instance_options[:alias]&.name
    end
  end
end
