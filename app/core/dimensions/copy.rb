# frozen_string_literal: true

module Dimensions
  class Copy < BaseCommand
    private_attr_accessor :source_dimension, :factors_to_copy, :client, :new_dimension,
                          :old_to_new_factor_mapping, :new_dimension_name

    def initialize(source_dimension, factors_to_copy, client, new_dimension_name: nil)
      @new_dimension_name = new_dimension_name
      @source_dimension = source_dimension
      @factors_to_copy = factors_to_copy
      @client = client
      @new_dimension = copy_source_dimension
      @old_to_new_factor_mapping = {}
    end

    def call
      source_dimension.all_factors.where(id: factors_to_copy).find_each do |factor|
        factor_maping = Factors::Copy.call!(factor, old_to_new_factor_mapping, factors_to_copy)

        old_to_new_factor_mapping.merge!(factor_maping)
      end

      new_factor_ids = old_to_new_factor_mapping.values.map(&:id)
      Factor.where(id: new_factor_ids).update_all(dimension_id: new_dimension.id)

      broadcast :ok, new_dimension: new_dimension, old_to_new_factor_mapping: old_to_new_factor_mapping
    end

    private

    def copy_source_dimension
      dimension = source_dimension.deep_clone(include: [:occupations])
      dimension.owner_id = client.id
      dimension.name = new_dimension_name if new_dimension_name
      dimension.skip_owner_validation = true
      dimension.save!
      dimension
    end
  end
end
