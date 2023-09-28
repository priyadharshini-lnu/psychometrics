# frozen_string_literal: true

module Assessments
  class LinkedAssessmentSerializer < ActiveModel::Serializer
    attributes :id, :name

    has_many :blocks, serializer: Assessments::BlockSerializer do
      object.blocks.
        selecting do
        ['blocks.*',
         coalesce(template.props, props).as('props'),
         coalesce(template.name, name).as('name')]
      end.
        joining { template.outer }.
        includes(questions_ams: :comments).
        where.has { (template.disabled == false) | (template.id == nil) }
    end
  end
end
