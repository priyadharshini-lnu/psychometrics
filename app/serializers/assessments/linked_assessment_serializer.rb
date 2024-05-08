# frozen_string_literal: true

module Assessments
  class LinkedAssessmentSerializer < Panko::Serializer
    attributes :id, :name, :blocks

    def blocks
      blocks = object.blocks.
               selecting do
                 ['blocks.*',
                  coalesce(template.props, props).as('props'),
                  coalesce(template.name, name).as('name')]
               end.
               joining { template.outer }.
               includes(questions_ams: :comments).
               where.has { (template.disabled == false) | (template.id == nil) }

      Panko::ArraySerializer.new(
        blocks,
        each_serializer: Assessments::BlockSerializer
      ).to_a
    end
  end
end
