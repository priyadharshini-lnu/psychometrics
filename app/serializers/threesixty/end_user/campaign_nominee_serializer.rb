module Threesixty::EndUser
  class CampaignNomineeSerializer < ActiveModel::Serializer
    attributes :id, :is_self, :campaign_id, :evaluators_count, :counters
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
  end
end
