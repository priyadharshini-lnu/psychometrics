# frozen_string_literal: true

class CampaignFactorValue < ApplicationRecord
  audited

  belongs_to :campaign
  belongs_to :user
  belongs_to :campaign_factor
  include Tenantable

  enum :calculation_type, { auto: 0, manual: 1 }

  def self.ransackable_attributes(_auth_object = nil)
    %w[id user_id]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[campaign_factor]
  end

  def value
    if campaign_factor.numeric_output_type?
      numeric_value
    elsif campaign_factor.string_output_type?
      string_value
    end
  end

  def value=(new_value)
    if campaign_factor.numeric_output_type? && new_value.is_a?(Numeric)
      self.numeric_value = new_value
      self.string_value = nil
    elsif campaign_factor.string_output_type? && new_value.is_a?(String)
      self.string_value = new_value
      self.numeric_value = nil
    end
  end
end
