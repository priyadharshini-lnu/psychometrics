# frozen_string_literal: true

class AssignUpdateSerializer < Panko::Serializer
  attributes :expired, :current_block

  def expired
    object.expired?
  end

  def current_block
    block = Block.find_by(id: context[:current_block_id])
    if block
      BlockSerializer.new(
        context: {
          piped_text_context: context[:piped_text_context]
        }
      ).serialize(block)
    end
  end
end
