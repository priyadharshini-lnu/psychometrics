# frozen_string_literal: true

module Api
  module V1
    class ReportDimensionsWithFactorsSerializer < ActiveModel::Serializer
      attribute :server_time do
        Time.now.utc.iso8601
      end

      has_many :dimensions, serializer: Api::V1::DimensionWithFactorsSerializer
    end
  end
end
