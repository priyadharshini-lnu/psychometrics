# frozen_string_literal: true

class UsersResultUpdateSerializer < ActiveModel::Serializer
  attributes :expired, :current_block

  def expired
    object.expired?
  end

  def current_block
    piped_text_context = {
      evaluator: object.evaluator,
      subject: object.subject,
      threesixty_campaign: @instance_options[:campaign],
      answers: object.reload.answers || {}
    }

    block = Block.find_by(id: @instance_options[:current_block_id])
    block ? BlockSerializer.new(block, piped_text_context: piped_text_context) : nil
  end
end
