# frozen_string_literal: true

module Administration
  module Assessors
    class CampaignSerializer < ActiveModel::Serializer
      attributes :id, :name, :start_date, :end_date, :status
    end
  end
end
