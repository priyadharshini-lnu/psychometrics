# frozen_string_literal: true

module Assessments
  class LinkedAssessmentSerializer < Panko::Serializer
    attributes :id, :name, :blocks

    def blocks
      template_table = Block.arel_table.alias('templates_blocks')
      blocks_table = Block.arel_table

      coalesce_props = Arel::Nodes::NamedFunction.new('COALESCE',
                                                      [template_table[:props], blocks_table[:props]]).as('props')
      coalesce_name = Arel::Nodes::NamedFunction.new('COALESCE',
                                                     [template_table[:name], blocks_table[:name]]).as('name')

      template_not_disabled = template_table[:disabled].eq(false)
      template_not_present = template_table[:id].eq(nil)

      blocks = object.blocks.
               left_outer_joins(:template).
               select('blocks.*', coalesce_props, coalesce_name).
               includes(:questions_ams).
               where(template_not_disabled.or(template_not_present))

      Panko::ArraySerializer.new(
        blocks,
        each_serializer: Assessments::BlockSerializer,
        context: {}
      ).to_a
    end
  end
end
