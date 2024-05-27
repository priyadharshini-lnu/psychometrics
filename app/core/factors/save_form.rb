# frozen_string_literal: true

module Factors
  class SaveForm < Rectify::Form
    attribute :id, Integer
    attribute :name, String
    attribute :code, String
    attribute :description, String
    attribute :scoring_strategy, String
    attribute :factors_sub_factors_attributes, Object
    attribute :icon, Object
    attribute :remove_icon, Boolean
    attribute :use_percentage, Boolean
    attribute :use_sub_factor_norm_score, Boolean
    attribute :external_scoring, Array
    attribute :scale_min, Float
    attribute :scale_max, Float
    attribute :precision, Numeric

    validates :name, presence: true
    validates :name, length: { maximum: 100 }, allow_blank: true
    validates :code, length: { minimum: 3, maximum: 4 }, allow_blank: true
    validate :avoid_cyclic_references
    validate :scale_min_max
    validates :precision, numericality: { only_integer: true }, allow_blank: true

    def avoid_cyclic_references
      return true unless id
      return true unless factors_sub_factors_attributes

      new_sub_factor_ids = factors_sub_factors_attributes.
                           select { |f| f['id'].blank? }.map { |f| f['sub_factor_id'].to_i }
      Factor.where(id: new_sub_factor_ids).map do |sf|
        if sf.descendant_ids.include?(id)
          errors.add(:factors_sub_factors_attributes, [sf.id, 'there is cyclic reference'])
        end
      end
    end

    def scale_min_max
      return true if scale_min.blank? && scale_max.blank?
      return errors.add(:scale_min, 'both should be filled or empty') if scale_min.blank? ^ scale_max.blank?

      errors.add(:scale_min, 'must be less than scale_max') if scale_min >= scale_max
    end
  end
end
