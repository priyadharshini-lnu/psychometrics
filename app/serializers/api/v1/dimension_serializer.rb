# frozen_string_literal: true

module Api
  module V1
    class DimensionSerializer < ActiveModel::Serializer
      attributes :id, :name, :occupations, :factors

      attribute :occupations, if: -> { include_occupations }
      attribute :factors, if: -> { include_factors }

      def include_occupations
        @instance_options[:include_occupations] == 'true'
      end

      def include_factors
        @instance_options[:include_factors] == 'true'
      end

      def report
        @instance_options[:report]
      end

      def since
        DateTime.parse(@instance_options[:since])
      end

      def occupations
        return [] unless report.has_data_configuration_occupations?

        occupation_list = if @instance_options[:since]
                            object.occupations.where('occupations.updated_at > ?', since)
                          else
                            object.occupations
                          end
        occupation_list.map do |occupation|
          Api::V1::OccupationSerializer.new(occupation)
        end
      end

      def factors
        factor_list = if @instance_options[:since]
                        object.factors.where(id: report.data_configuration_factor_ids).
                          where('factors.updated_at > ?', since)
                      else
                        object.factors.where(id: report.data_configuration_factor_ids)
                      end

        factor_list.map do |factor|
          Api::V1::FactorSerializer.new(factor)
        end
      end
    end
  end
end
