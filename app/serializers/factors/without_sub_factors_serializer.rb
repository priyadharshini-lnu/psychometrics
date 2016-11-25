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
  class WithoutSubFactorsSerializer < ActiveModel::Serializer
    type :factor
    attributes :id, :name, :parent_id, :question_ids, :description, :icon

    def icon
      object.icon.url(:middle)
    end

    def question_ids
      # TODO: remove n+1 query, may be remove active serializer, use jbuilder
      if @instance_options[:assessment_id]
        object.factors_scoring.where(assessment_id: @instance_options[:assessment_id]).where('json_array_length(props) > 0').pluck(:question_id)
      else
        []
      end
    end
  end
end
