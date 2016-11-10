module Communications
  class AfterCompleteJob < ApplicationJob
    queue_as :communication

    def perform(assign_id)
      assign = Assign.select(:assessment_id, :membership_id).find(assign_id)
      Communication.enabled.delivery_after_complete.where(assessment_id: assign.assessment_id).find_each(batch_size: 100) do |communication|
        if communication.selected_memberships.pluck(:id).include?(assign.membership_id)
          communication.emails.create(membership_id: assign.membership_id)
        end
      end
    end
  end
end
