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
class AssessmentChannel < ApplicationCable::Channel

  include Actions::Block

  def subscribed
    stream_from 'assessment'
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
