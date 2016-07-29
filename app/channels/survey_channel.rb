#
# Example:
#
# 1. Client send: { action_name: block_create }
# 2. Need to implement method `create` in module Actions::Block
#     action :create do
#
#     end
# 3. include Actions::Block
#
class SurveyChannel < ApplicationCable::Channel

  # include Actions::Block

  def subscribed
    Rails.logger.warn "subscribed #{current_administrator.inspect}"
    stream_from 'survey'
  end

  def speak
    # event = WsEvents::BaseEvent.build(current_user, data)
    # event.response
    ActionCable.server.broadcast('survey', message: 'hello',
        notification: { level: 'success', message: 'New Message' })
  end





  # def action(name, &block)
  #       define_method name do |data|
  #         request_id = data.req_id
  #         block.call(data)
  #
  #       end
  # end
  #
  # action :add_block do |data|
  #
  #
  # end
  #
  # action :add_block do |data|
  #
  # end

end
