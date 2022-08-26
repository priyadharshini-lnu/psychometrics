# frozen_string_literal: true

class FillAssessmentAndUsersResultForThreesixtyParticipant < ActiveRecord::Migration[5.1]
  def change
    Threesixty::Participant.find_each do |participant|
      result = participant.result
      participant.update(users_result_id: result&.id,
                         assessment_id: participant.campaign.threesixty_campaign.assessment_id)
    end
  end
end
