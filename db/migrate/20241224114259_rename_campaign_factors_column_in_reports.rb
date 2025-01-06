# frozen_string_literal: true

# rubocop:disable Naming/VariableNumber
class RenameCampaignFactorsColumnInReports < ActiveRecord::Migration[7.1]
  def change
    rename_column :reports, :campaign_factors, :campaign_factors_deprecated_on_2024_12_23
  end
end
# rubocop:enable Naming/VariableNumber
