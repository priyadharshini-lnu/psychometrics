# frozen_string_literal: true

module Api
  module V1
    class OccupationSerializer < ActiveModel::Serializer
      attributes :id, :name, :description

      attribute :updated_at do
        object.updated_at.utc.iso8601
      end
    end
  end
end
