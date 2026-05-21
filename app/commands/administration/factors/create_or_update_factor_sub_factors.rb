# frozen_string_literal: true

module Administration
  module Factors
    class CreateOrUpdateFactorSubFactors < BaseCommand
      private_attr_reader :factor, :dimension, :factors_sub_factors_attrs

      MODIFICATION_TYPE_CREATE = 1
      MODIFICATION_TYPE_UPDATE = 2
      MODIFICATION_TYPE_DESTROY = 3

      def initialize(factor, dimension, factors_sub_factors_attrs)
        @factor = factor
        @dimension = dimension
        @factors_sub_factors_attrs = factors_sub_factors_attrs
      end

      def call
        result = create_or_update_factor
        broadcast(:ok, result)
      rescue ActiveRecord::RecordInvalid => e
        broadcast(:invalid, e.record.errors)
      end

      private

      def create_or_update_factor
        ActiveRecord::Base.transaction do
          process_sub_factors(factors_sub_factors_attrs)
        end

        factor
      end

      def process_sub_factors(factors_sub_factors_attrs)
        return if factors_sub_factors_attrs.blank?

        factors_sub_factors_attrs.each do |attrs|
          next if attrs.blank?

          modification_type = attrs.delete('modification_type').to_i

          case modification_type
            when MODIFICATION_TYPE_CREATE
              create_sub_factor_with_relationship(attrs)
            when MODIFICATION_TYPE_UPDATE
              update_sub_factor_with_relationship(attrs)
            when MODIFICATION_TYPE_DESTROY
              destroy_sub_factor_with_relationship(attrs)
          end
        end
      end

      def create_sub_factor_with_relationship(attrs)
        sub_factor_id = attrs.delete('sub_factor_id')
        if factor.child_indicator?
          sub_factor = create_sub_factor(attrs)
        else
          sub_factor = find_sub_factor(sub_factor_id)
          return if sub_factor.blank?
        end

        FactorsSubFactor.create!(
          factor: factor,
          sub_factor: sub_factor,
          weight: attrs['weight'] || 1,
          position: attrs['position'] || 0,
          predicate: attrs['predicate'],
          value: attrs['value']
        )
      end

      def find_sub_factor(factor_id)
        Factor.find_by(id: factor_id)
      end

      def update_sub_factor_with_relationship(attrs)
        join_record_id = attrs['id']
        return if join_record_id.blank?

        join_record = FactorsSubFactor.find(join_record_id)

        join_record_attrs = {
          weight: attrs['weight'] || 1,
          position: attrs['position'] || 0
        }

        join_record_attrs[:predicate] = attrs['predicate'] if attrs.key?('predicate')
        join_record_attrs[:value] = attrs['value'] if attrs.key?('value')

        join_record.update!(join_record_attrs)

        if factor.child_indicator?
          sub_factor = join_record.sub_factor

          update_attrs = {
            name: attrs['name'],
            description: attrs['description'],
            precision: attrs['precision'],
            score_min: factor.score_min,
            score_max: factor.score_max,
            score_definitions: attrs['score_definitions'] || [],
            what_to_look_for: attrs['what_to_look_for']
          }.compact

          sub_factor.update!(update_attrs)
        end
      end

      def destroy_sub_factor_with_relationship(attrs)
        join_record_id = attrs['id']
        return if join_record_id.blank?

        join_record = FactorsSubFactor.find(join_record_id)

        if join_record.sub_factor.indicator?
          join_record.sub_factor.destroy!
        end

        join_record.destroy!
      end

      def create_sub_factor(attrs)
        Factor.create!(
          dimension: dimension,
          name: attrs['name'],
          description: attrs['description'],
          precision: attrs['precision'],
          factor_type: attrs['factor_type'] || 'indicator',
          score_min: attrs['score_min'],
          score_max: attrs['score_max'],
          score_definitions: attrs['score_definitions'] || [],
          what_to_look_for: attrs['what_to_look_for']
        )
      end
    end
  end
end
