module Api
  module V1
    module Results
      class AssessmentSerializer < ActiveModel::Serializer
        attributes :id, :name, :results

        def results
          normed_factors = instance_options[:rows].select do |row|
            row.dig(:config_data, 'type') == 'normed_factor' && row.dig(:config_data, 'assessmentId') == object.id
          end
          ranked_occupations = instance_options[:rows].select do |row|
            row.dig(:config_data, 'type') == 'ranked_occupations' &&
              row.dig(:config_data, 'assessmentId') == object.id &&
              row.dig(:config_data, 'order') == 'desc'
          end

          {
            normed_factors: normed_factors.map { |f| Api::V1::Results::NormedFactorSerializer.new(f).to_h },
            ranked_occupations: ranked_occupations.map { |o| Api::V1::Results::RankedOccupationSerializer.new(o).to_h },
          }
        end

      end
    end
  end
end
