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

class AssessmentChannel < ApplicationCable::Channel
  include Actions::Block
  include Actions::Question
  include Pundit
  include Administration::Policies

  def subscribed
    assessment = Assessment.find_by_id(params['assessment_id'])
    transmit({
        action: 'assessment_data',
        data: AssessmentSerializer.new(assessment).to_hash(include: '**')
    })
  end

  def pundit_user
    current_administrator
  end
end
