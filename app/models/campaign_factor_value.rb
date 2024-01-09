# frozen_string_literal: true

class CampaignFactorValue < ApplicationRecord
  belongs_to :campaign
  belongs_to :user
  belongs_to :campaign_factor

  def value
    if numeric_value
      numeric_value
    elsif string_value
      string_value
    end
  end

  def value=(new_value)
    if campaign_factor.numeric_output_type? && new_value.is_a?(Numeric)
      self.numeric_value = new_value
    elsif campaign_factor.string_output_type? && new_value.is_a?(String)
      self.string_value = new_value
    end
  end
end
