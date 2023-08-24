# frozen_string_literal: true

class Api::V2::Administration::WorkshopResourceResource < Api::V2::Administration::BaseResource
  attributes :name, :url, :workshop_id

  has_one :workshop

  def self.records(opts = {})
    super(opts).where(workshop_id: opts[:context][:params]['workshop_id'])
  end
end
