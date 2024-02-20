# frozen_string_literal: true

module Api
  module V1
    module Results
      class RankedOccupationSerializer < Panko::Serializer
        attributes :id, :rank, :name, :value, :stars

        def id
          object[:key]
        end

        def rank
          object.dig(:config_data, 'position')
        end

        def name
          object[:name]
        end

        def value
          object[:value]
        end

        def stars
          Occupations::CalculateStars.call!(value)
        end
      end
    end
  end
end
