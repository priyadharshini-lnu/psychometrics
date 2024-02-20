# frozen_string_literal: true

module Api
  module V1
    module Results
      class AssessmentSerializer < Panko::Serializer
        attributes :id, :name, :results

        def results
          normed_factors = context[:rows].select do |row|
            row.dig(:config_data, 'type') == 'normed_factor' && row.dig(:config_data, 'assessmentId') == object.id
          end
          raw_factors = context[:rows].select do |row|
            row.dig(:config_data, 'type') == 'raw_factor' && row.dig(:config_data, 'assessmentId') == object.id
          end
          ranked_occupations = context[:rows].select do |row|
            row.dig(:config_data, 'type') == 'ranked_occupations' &&
              row.dig(:config_data, 'assessmentId') == object.id &&
              row.dig(:config_data, 'order') == 'desc'
          end

          {
            normed_factors: Panko::ArraySerializer.new(
              normed_factors,
              each_serializer: Api::V1::Results::FactorSerializer
            ).to_a,
            raw_factors: Panko::ArraySerializer.new(
              raw_factors,
              each_serializer: Api::V1::Results::FactorSerializer
            ).to_a,
            ranked_occupations: Panko::ArraySerializer.new(
              ranked_occupations,
              each_serializer: Api::V1::Results::RankedOccupationSerializer
            ).to_a
          }
        end
      end
    end
  end
end
