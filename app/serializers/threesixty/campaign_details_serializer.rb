
module Threesixty
  class CampaignDetailsSerializer < ActiveModel::Serializer
    attributes :invited_evaluators, :responded_evaluators, :total_evaluators_for_assessment

    def invited_evaluators
      Participant.active.where(campaign_id: object.campaign_id, subject_id: instance_options[:users_report].user_id).count
    end

    def responded_evaluators
      7
    end

    def total_evaluators_for_assessment
      Participant.active.where(campaign_id: object.campaign_id).count
    end
  end
end
