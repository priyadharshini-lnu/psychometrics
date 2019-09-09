# frozen_string_literal: true

module Api
  module V1
    module Results
      class RankedOccupationSerializer < ActiveModel::Serializer
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

        # rubocop:disable Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
        def stars
          return 0 if value.nil?

          val = value
          return 1 if val >= 0.6 && val < 0.7
          return 2 if val >= 0.7 && val < 0.8
          return 3 if val >= 0.8 && val < 0.9
          return 4 if val >= 0.9 && val < 1
          return 5 if val == 1

          0
        end
        # rubocop:enable Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
      end
    end
  end
end
