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
          return 1 if (0...0.55).include?(val)
          return 2 if (0.55...0.65).include?(val)
          return 3 if (0.65...0.75).include?(val)
          return 4 if (0.75...0.85).include?(val)
          return 5 if (0.85..1).include?(val)
          0
        end

      end
    end
  end
end
