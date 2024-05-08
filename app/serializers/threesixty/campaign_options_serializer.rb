# frozen_string_literal: true

module Threesixty
  class CampaignOptionsSerializer < Panko::Serializer
    attributes :participants, :reports, :messages

    def participants
      object&.participants
    end

    def reports
      object&.reports
    end

    def messages
      object&.messages
    end
  end
end
