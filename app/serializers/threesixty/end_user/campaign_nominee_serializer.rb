# frozen_string_literal: true

module Threesixty::EndUser
  class CampaignNomineeSerializer < Panko::Serializer
    attributes :id, :is_self, :campaign_id, :counters, :is_nomination_completed

    has_one :user, serializer: UserSerializer

    def campaign_id
      object.campaign.threesixty_campaign.id
    end

    def counters
      Threesixty::Participants::CalcCounters.call!([object.user_id], object.campaign.threesixty_campaign)
    end

    def is_self
      object.user_id == context[:current_user].id
    end

    def is_nomination_completed
      is_nomination_complete_hash[object.user_id]
    end

    def is_nomination_complete_hash
      context[:is_nomination_complete_hash]
    end
  end
end
