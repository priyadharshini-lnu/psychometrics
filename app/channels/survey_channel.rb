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
class SurveyChannel < ApplicationCable::Channel
  include Actions::Block
  # Authorisation flow
  #
  include Pundit
  ## Prepend :administration namespace to policy
  include Administration::Policies
  ## Custom current user helper for Pundit
  def pundit_user
    current_administrator
  end

  def subscribed

    stream_from 'survey'
    Rails.logger.warn  " params #{current_administrator.inspect}"
    Rails.logger.warn  " sss SS #{params.inspect}"
  end

  def fetch(data)
    @assessment = Assessment.last

  end
end
