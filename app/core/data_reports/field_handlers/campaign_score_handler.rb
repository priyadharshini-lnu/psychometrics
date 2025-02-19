# frozen_string_literal: true

module DataReports::FieldHandlers
  class CampaignScoreHandler < ::DataReports::BaseFieldHandler
    def call
      factor = ctx[:campaign_factors][field['factor_code']]

      return broadcast :ok, nil unless factor

      cf = ctx[:campaign_scorings].dig(cu.id, factor.id.to_s)

      return broadcast :ok, nil unless cf

      value = Oj.load(cf).try(:[], 'value')
      value = value.to_f if value.present? && factor.output_type == 'numeric'

      broadcast :ok, value
    end
  end
end
