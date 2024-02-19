# frozen_string_literal: true

module Blocks
  class Channel < ApplicationCable::Channel
    include Blocks::Actions::Block
    include Blocks::Actions::Question
    include Blocks::Actions::Comment
    include Pundit
    include Administration::Policies

    def subscribed
      block = Block.find(params['block_id'])
      if Administration::BlockPolicy.new(current_user, block).edit?
        transmit(
          {
            action: 'block_data',
            data: BlockSerializer.new(
              context: {
                include: '**'
              }
            ).serialize(block)
          }
        )
      else
        reject
      end
    end

    def pundit_user
      current_user
    end
  end
end
