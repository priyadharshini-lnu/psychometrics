# frozen_string_literal: true

module Api
  module V1
    class ReportDimensionsSerializer < Panko::Serializer
      attributes :server_time

      def server_time
        Time.now.utc.iso8601
      end

      has_many :dimensions, each_serializer: Api::V1::DimensionSerializer
    end
  end
end
