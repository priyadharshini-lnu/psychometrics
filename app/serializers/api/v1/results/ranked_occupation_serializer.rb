module Api
  module V1
    module Results
      class RankedOccupationSerializer < ActiveModel::Serializer
        attributes :key, :rank, :name, :normed_factors

        def key
          object[:key]
        end

        def rank
          object.dig(:config_data, 'position')
        end

        def name
          object[:name]
        end

        def normed_factors
          []
        end
      end
    end
  end
end
