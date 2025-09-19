# frozen_string_literal: true

module Reports
  class CampaignFactorSerializer < Panko::Serializer
    attributes :id, :code, :name, :output_type, :description
  end
end
