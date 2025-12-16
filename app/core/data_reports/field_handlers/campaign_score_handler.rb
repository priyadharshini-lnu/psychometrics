# frozen_string_literal: true

module DataReports::FieldHandlers
  class CampaignScoreHandler < ::DataReports::BaseFieldHandler
    ALLOWED_FIELD_NAMES = %w[calculated_date finalized_date finalized].freeze
    DEFAULT_FORMAT = '%d-%b-%Y %H:%M:%S'

    def call
      if ALLOWED_FIELD_NAMES.include?(field['field_name'])
        return broadcast :ok, send(field['field_name'])
      end

      factor = ctx[:campaign_factors][field['factor_code']]

      return broadcast :ok, nil unless factor

      cf = ctx[:campaign_scorings].dig(cu.id, factor.id.to_s)

      return broadcast :ok, nil unless cf

      value = Oj.load(cf).try(:[], 'value')
      value = value.to_f if value.present? && factor.output_type == 'numeric'

      broadcast :ok, value
    end

    private

    def calculated_date
      cu.campaign_scores_calculated_date&.strftime(field['date_format'] || DEFAULT_FORMAT)
    end

    def finalized_date
      cu.campaign_scores_finalized_date&.strftime(field['date_format'] || DEFAULT_FORMAT)
    end

    def finalized
      cu.campaign_scores_finalized ? I18n.t('yes') : I18n.t('no')
    end
  end
end
