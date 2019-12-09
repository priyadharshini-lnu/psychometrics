# frozen_string_literal: true

module Factors
  class Copy < BaseCommand
    private_attr_accessor :factor, :cloned_factor, :old_to_new_factor_mapping

    def initialize(factor, cloned_factor = nil)
      @factor = factor
      @cloned_factor = cloned_factor
      @old_to_new_factor_mapping = {}
    end

    def call
      old_to_new_factor_mapping[factor.id] ||= cloned_factor || factor.clone_and_save
      factor.ancestors.each do |parent_factor|
        unless old_to_new_factor_mapping[parent_factor.id]
          new_factor = parent_factor.clone
          new_factor.save!
          old_to_new_factor_mapping[parent_factor.id] = new_factor
        end
        create_factor_sub_factor(parent_factor, factor, old_to_new_factor_mapping[parent_factor.id],
                                 old_to_new_factor_mapping[factor.id])
      end

      broadcast :ok, old_to_new_factor_mapping
    end

    private

    def create_factor_sub_factor(old_factor, old_sub_factor, new_factor, new_sub_factor)
      factor_sub_factor = FactorsSubFactor.find_by(factor_id: old_factor.id, sub_factor_id: old_sub_factor.id)
      return if factor_sub_factor.nil?

      attributes = factor_sub_factor.attributes.except('id', 'created_at', 'updated_at').merge(
        factor_id: new_factor.id, sub_factor_id: new_sub_factor.id
      )
      FactorsSubFactor.create(attributes)
    end
  end
end
