# frozen_string_literal: true

module Dimensions
  class SaveSubFactors < BaseCommand
    attr_accessor :factor, :sub_factors_params

    def initialize(factor, sub_factors_params)
      @factor = factor
      @sub_factors_params = sub_factors_params
    end

    def call
      Factor.transaction do
        existing_ids = factor.factors_sub_factors.pluck(:id)
        sub_factor_ids = sub_factors_params.map { |sf| sf[:id].to_i }
        ids_to_remove = existing_ids - sub_factor_ids

        factor.factors_sub_factors.where(id: ids_to_remove).destroy_all if ids_to_remove.any?

        sub_factors_params.each do |sub_factor_param|
          params = {
            factor_id: factor.id,
            sub_factor_id: sub_factor_param[:sub_factor_id],
            predicate: sub_factor_param[:predicate],
            weight: sub_factor_param[:weight],
            value: sub_factor_param[:value],
            position: sub_factor_param[:position]
          }
          sub_factor = factor.factors_sub_factors.find_by(id: sub_factor_param[:id])
          if sub_factor
            sub_factor.update!(params)
          else
            factor.factors_sub_factors.create(params)
          end
        end
      end
    end
  end
end
