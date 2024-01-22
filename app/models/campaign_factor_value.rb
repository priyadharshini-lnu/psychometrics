# frozen_string_literal: true

class CampaignFactorValue < ApplicationRecord
  belongs_to :campaign
  belongs_to :user
  belongs_to :campaign_user, primary_key: :user_id, foreign_key: :user_id
  belongs_to :campaign_factor

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
