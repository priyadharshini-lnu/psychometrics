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

        def stars
          return 0 if value.nil?

          val = value
          return 1 if (0...0.55).cover?(val)
          return 2 if (0.55...0.65).cover?(val)
          return 3 if (0.65...0.75).cover?(val)
          return 4 if (0.75...0.85).cover?(val)
          return 5 if (0.85..1).cover?(val)

          0
        end
        # rubocop:enable
      end
    end
  end
end
