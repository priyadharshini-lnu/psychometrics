# frozen_string_literal: true

module Reports
  class UpdateCampaignFactors < BaseCommand
    class InvalidFactorParams < StandardError; end
    class TooManyCampaignFactors < StandardError; end

    MAX_CAMPAIGN_FACTORS = 300

    private_attr_reader :report, :campaign_factors_params

    def initialize(report, campaign_factors_params)
      @report = report
      @campaign_factors_params = campaign_factors_params

      validate_params!
      validate_campaign_factors_limit!
    end

    def call
      ActiveRecord::Base.transaction do
        remove_unused_factors
        update_campaign_factors!
        clean_module_references
      end
    end

    private

    def validate_params!
      return if campaign_factors_params.is_a?(Array) &&
                campaign_factors_params.all? { |f| valid_factor?(f) }

      raise InvalidFactorParams, I18n.t('administration.report_builder.campaign_factors.invalid_factor_params')
    end

    def validate_campaign_factors_limit!
      total_factors = new_factor_codes.size
      return if total_factors <= MAX_CAMPAIGN_FACTORS

      raise TooManyCampaignFactors,
            I18n.t('administration.report_builder.campaign_factors.too_many_factors', count: MAX_CAMPAIGN_FACTORS)
    end

    def valid_factor?(factor)
      %w[code name output_type].all? { |key| factor[key].present? }
    end

    def remove_unused_factors
      removed_codes = existing_factor_codes - new_factor_codes
      report.campaign_factors.where(code: removed_codes).delete_all
      @removed_codes = removed_codes
    end

    def update_campaign_factors!
      factors = campaign_factors_params.map do |factor_params|
        {
          code: factor_params['code'],
          name: factor_params['name'],
          output_type: factor_params['output_type'],
          description: factor_params['description'],
          report_id: report.id,
          tenant_id: report.tenant_id
        }
      end

      CampaignFactor.import(
        factors,
        on_duplicate_key_update: { conflict_target: %i[code report_id], columns: %i[name output_type description] },
        validate: false
      )
    end

    def clean_module_references
      campaign_factor_modules.each do |mod|
        next unless mod.props.dig('source', 'codes').is_a?(Array)

        mod.props['source']['codes'] -= @removed_codes
        mod.save
      end
    end

    def campaign_factor_modules
      Reports::Module.joins(:page).
        where(reports_pages: { report_id: report.id }).
        where("reports_modules.props -> 'source' ->> 'type' = 'CampaignFactors'")
    end

    def existing_factor_codes
      @existing_factor_codes ||= report.campaign_factors.pluck(:code)
    end

    def new_factor_codes
      @new_factor_codes ||= campaign_factors_params.pluck('code')
    end
  end
end
