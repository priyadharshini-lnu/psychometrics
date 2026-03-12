# frozen_string_literal: true

module Administration
  module Factors
    class CreateOrUpdateFactor < BaseCommand
      private_attr_reader :factor, :dimension, :params

      JOIN_TABLE_ATTRIBUTES = %w[id weight _destroy sub_factor_id position predicate value].freeze

      def initialize(factor, dimension, params)
        @factor = factor
        @dimension = dimension
        @params = params.to_h
      end

      def call
        result = create_or_update_factor
        broadcast(:ok, result)
      rescue ActiveRecord::RecordInvalid => e
        broadcast(:invalid, e.record.errors)
      end

      private

      def create_or_update_factor
        new_indicators_attrs = params.delete('new_indicators_attributes')
        factors_sub_factors_attrs = params.delete('factors_sub_factors_attributes')

        params['factors_sub_factors_attributes'] = sanitize_join_table_attrs(factors_sub_factors_attrs)

        ActiveRecord::Base.transaction do
          if factor.persisted?
            factor.update!(params)
            update_sub_factors(factors_sub_factors_attrs)
          else
            factor.assign_attributes(params)
            factor.dimension = dimension
            factor.save!
          end

          create_new_indicators(new_indicators_attrs)
        end

        factor
      end

      def sanitize_join_table_attrs(attrs)
        return [] if attrs.blank?

        attrs.map { |attr| attr.slice(*JOIN_TABLE_ATTRIBUTES) }
      end

      def update_sub_factors(factors_sub_factors_attrs)
        return if factors_sub_factors_attrs.blank?

        factors_sub_factors_attrs.each do |attrs|
          next if attrs.blank? || attrs['_destroy'].present?

          sub_factor_id = attrs['sub_factor_id']
          next if sub_factor_id.blank?

          indicator_attrs = {
            name: attrs['name'],
            description: attrs['description'],
            precision: attrs['precision'],
            score_min: factor.child_indicator? ? factor.score_min : attrs['score_min'],
            score_max: factor.child_indicator? ? factor.score_max : attrs['score_max'],
            score_definitions: attrs['score_definitions'] || [],
            what_to_look_for: attrs['what_to_look_for']
          }

          Factor.find(sub_factor_id).update!(indicator_attrs)
        end
      end

      def create_new_indicators(new_indicators_attrs)
        return if new_indicators_attrs.blank?

        factor.create_indicators_from_attributes(new_indicators_attrs)
      end
    end
  end
end
