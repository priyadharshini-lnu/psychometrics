# frozen_string_literal: true

module Api
  module V1
    class FactorSerializer < Panko::Serializer
      attributes :id, :name, :description, :updated_at

      def updated_at
        object.updated_at.utc.iso8601
      end
    end
  end
end
