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
  include Actions::Assessment
  include Actions::Block
  include Actions::Question
  include Actions::Comment
  include Actions::Trash
  include Pundit
  include Administration::Policies

  def subscribed
    assessment = Assessment.where(id: params['assessment_id']).includes(blocks: {questions: :comments}).first
    raise "Can't find Assessment with id=#{params['assessment_id']}" unless assessment
    transmit({
        action: 'assessment_data',
        data: AssessmentSerializer.new(assessment).to_hash(include: '**')
    })
  end

  def pundit_user
    current_administrator
  end
end
