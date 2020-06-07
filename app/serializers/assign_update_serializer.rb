# frozen_string_literal: true

class AssignUpdateSerializer < ActiveModel::Serializer
  attributes :expired, :current_block

  def expired
    object.expired?
  end

  def current_block
    block = Block.find_by(id: @instance_options[:current_block_id])
    block ? BlockSerializer.new(block, piped_text_context: @instance_options[:piped_text_context]) : nil
  end
end
