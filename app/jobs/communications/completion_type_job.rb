module Communications
  class CompletionTypeJob < ApplicationJob
    queue_as :communication

    def perform(assign)
      communications = Communication.enabled.completion.where(assessment_id: assign.assessment_id)
      ::Services::Communications::CheckByLevelStack.call(
        membership: assign.membership,
        communications: communications
      )
    end
  end
end
