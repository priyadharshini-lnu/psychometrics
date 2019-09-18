# frozen_string_literal: true

# == Schema Information
#
# Table name: factors
#
#  id               :integer          not null, primary key
#  name             :string
#  subfactors_count :integer          default(0)
#  questions_count  :integer          default(0)
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  dimension_id     :integer
#  parent_id        :string
#  disabled         :boolean          default(FALSE)
#
module Factors
  class WithSubFactorsSerializer < ActiveModel::Serializer
    type :factor
    attributes :id, :name, :parent_id, :question_ids, :description, :icon, :alias, :scoring_strategy
    has_many :factors_sub_factors, serializer: FactorsSubFactorSerializer

    def icon
      # binding.pry
      object.icon.url
    end

    def question_ids
      # TODO: remove n+1 query, may be remove active serializer, use jbuilder
      if @instance_options[:assessment_id]
        object.question_ids # object.factors_scoring.where(assessment_id:
        # @instance_options[:assessment_id]).where('json_array_length(props) > 0').pluck(:question_id)
      else
        []
      end
    end

    def alias
      @instance_options[:alias]&.name
    end
  end
end
