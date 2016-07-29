#
# Example:
#
# 1. Client send: { action_name: block_create }
# 2. Need to implement method `create` in module Actions::Block
#     action :create do |data, current_administrator, assessment|
#
#     end
# 3. include Actions::Block
#

# TODO: rename to assessment_channel!!!
class SurveyChannel < ApplicationCable::Channel
  include Actions::Block

  include Pundit
  include Administration::Policies

  def subscribed
    stream_from 'survey'
  end

  def fetch
    @assessment = Assessment.last
    # use params['assessment_id']
    transmit({'fetch_your_data': true})
  end

  def pundit_user
    current_administrator
  end
end
