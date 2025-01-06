# frozen_string_literal: true

module Reports
  class UpdateCampaignFactors < BaseCommand
    class InvalidFactorParams < StandardError; end

    private_attr_reader :report, :campaign_factors_params

    def initialize(report, campaign_factors_params)
      @report = report
      @campaign_factors_params = campaign_factors_params

      validate_params!
    end

    def call
      remove_unused_factors
      update_campaign_factors!
      clean_module_references
    end

    private

    def validate_params!
      return if campaign_factors_params.is_a?(Array) &&
                campaign_factors_params.all? { |f| valid_factor?(f) }

      raise InvalidFactorParams, 'Invalid campaign factors parameters format'
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
      campaign_factors_params.each do |factor_params|
        update_campaign_factor(factor_params)
      end
    end

    def update_campaign_factor(factor_params)
      factor_attrs = {
        code: factor_params['code'],
        name: factor_params['name'],
        output_type: factor_params['output_type']
      }

      factor = report.campaign_factors.find_or_initialize_by(code: factor_params['code'])
      factor.update!(factor_attrs)
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
      @new_factor_codes ||= campaign_factors_params.map { |f| f['code'] }
    end
  end
end
