# frozen_string_literal: true

module Api
  module V1
    class DimensionSerializer < Panko::Serializer
      attributes :id, :name, :occupations, :factors

      def include_occupations
        context[:include_occupations] == 'true'
      end

      def include_factors
        context[:include_factors] == 'true'
      end

      def report
        context[:report]
      end

      def since
        DateTime.parse(context[:since])
      end

      def occupations
        return [] unless include_occupations

        return [] unless report.has_data_configuration_occupations?

        occupation_list = if context[:since]
                            object.occupations.where('occupations.updated_at > ?', since)
                          else
                            object.occupations
                          end
        occupation_list.map do |occupation|
          Api::V1::OccupationSerializer.new.serialize(occupation)
        end
      end

      def factors
        return [] unless include_factors

        factor_list = if context[:since]
                        object.all_factors.where(id: report.data_configuration_factor_ids).
                          where('factors.updated_at > ?', since)
                      else
                        object.all_factors.where(id: report.data_configuration_factor_ids)
                      end

        factor_list.map do |factor|
          Api::V1::FactorSerializer.new.serialize(factor)
        end
      end
    end
  end
end
