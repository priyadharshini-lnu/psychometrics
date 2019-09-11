# frozen_string_literal: true

module Api
  module V1
    module Results
      class NormedFactorSerializer < ActiveModel::Serializer
        attributes :id, :name, :value

        def id
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
