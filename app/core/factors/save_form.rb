# frozen_string_literal: true

module Factors
  class SaveForm < Rectify::Form
    attribute :id, Integer
    attribute :name, String
    attribute :description, String
    attribute :scoring_strategy, String
    attribute :factors_sub_factors_attributes, Object
    attribute :icon, Object
    attribute :remove_icon, Boolean

    validates :name, presence: true
    validates :name, length: { maximum: 100 }, allow_blank: true
    validate :avoid_cyclic_references

    def avoid_cyclic_references
      return true unless id
      return true unless factors_sub_factors_attributes

      new_sub_factor_ids = factors_sub_factors_attributes.values.
                           select { |f| f['id'].blank? }.map { |f| f['sub_factor_id'].to_i }
      Factor.where(id: new_sub_factor_ids).map do |sf|
        if sf.descendant_ids.include?(id)
          errors.add(:factors_sub_factors_attributes, [sf.id, 'there is cyclic reference'])
        end
      end
    end
  end
end
