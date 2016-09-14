module Blocks
  class Channel < ApplicationCable::Channel
    include Blocks::Actions::Question
    include Blocks::Actions::Comment
    include Pundit
    include Administration::Policies

    def subscribed
      block = Block.find(params['block_id'])
      transmit({
                   action: 'block_data',
                   data:   BlockSerializer.new(block).to_hash(include: '**')
               })
    end

    def pundit_user
      current_administrator
    end
  end
end
