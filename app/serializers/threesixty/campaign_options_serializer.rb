# frozen_string_literal: true

module Threesixty
  class CampaignOptionsSerializer < ActiveModel::Serializer
    attributes :participants, :reports, :messages
  end
end
