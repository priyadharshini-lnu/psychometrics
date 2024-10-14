# frozen_string_literal: true

module Factors
  class Copy < BaseCommand
    private_attr_accessor :factor, :old_to_new_factor_mapping, :old_to_new_factor_mapping, :factors_to_copy

    def initialize(factor, old_to_new_factor_mapping = {}, factors_to_copy = [])
      @factor = factor
      @factors_to_copy = factors_to_copy
      @old_to_new_factor_mapping = old_to_new_factor_mapping.dup
    end

    def call
      old_to_new_factor_mapping[factor.id] ||= get_cloned_factor(factor)
      factor.ancestors.where(id: factors_to_copy).each do |parent_factor|
        unless old_to_new_factor_mapping[parent_factor.id]
          new_factor = get_cloned_factor(parent_factor)
          old_to_new_factor_mapping[parent_factor.id] = new_factor
        end
        create_factor_sub_factor(parent_factor, factor, old_to_new_factor_mapping[parent_factor.id],
                                 old_to_new_factor_mapping[factor.id])
      end

      broadcast :ok, old_to_new_factor_mapping
    end

    private

    def get_cloned_factor(factor)
      return old_to_new_factor_mapping[factor.id] if old_to_new_factor_mapping[factor.id]

      new_factor = factor.dup
      new_factor.copy_and_upload(factor.icon, :icon) if factor.icon.attached?
      new_factor.save!
      new_factor
    end

    def create_factor_sub_factor(old_factor, old_sub_factor, new_factor, new_sub_factor)
      factor_sub_factor = FactorsSubFactor.find_by(factor_id: old_factor.id, sub_factor_id: old_sub_factor.id)
      return if factor_sub_factor.nil?

      attributes = factor_sub_factor.attributes.except('id', 'created_at', 'updated_at').merge(
        factor_id: new_factor.id, sub_factor_id: new_sub_factor.id, weight: factor_sub_factor.weight,
        predicate: factor_sub_factor.predicate, value: factor_sub_factor.value
      )
      FactorsSubFactor.create(attributes)
    end
  end
end
