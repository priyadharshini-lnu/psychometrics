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
      object.user_id == instance_options[:current_user].id
    end

    def is_nomination_completed
      instance_options[:is_nomination_completed]
    end
  end
end
