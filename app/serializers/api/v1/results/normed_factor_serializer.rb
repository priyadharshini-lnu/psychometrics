module Api
  module V1
    module Results
      class NormedFactorSerializer < ActiveModel::Serializer
        attributes :key, :name, :value

        def key
          object[:key]
        end

        def name
          object[:name]
        end

        def value
          object[:value]
        end
      end
    end
  end
end
