module Threesixty::EndUser
  class CampaignNomineeSerializer < ActiveModel::Serializer
    attributes :id, :is_self, :campaign_id, :evaluators_count, :counters, :is_nomination_completed
    has_one :user, serializer: UserSerializer

    def campaign_id
      object.campaign.threesixty_campaign.id
    end

    def counters
      Threesixty::Participants::CalcCounters.call!([object.user_id], object.campaign.threesixty_campaign)
    end

    def is_self
      object.user_id == current_user.id
    end

    def is_nomination_completed
      # TODO: Fix N+1
      Threesixty::Subjects::IsNominationRequirementComplete.call!(object.campaign.threesixty_campaign, object.user).dig(object.user_id)
    end
  end
end
