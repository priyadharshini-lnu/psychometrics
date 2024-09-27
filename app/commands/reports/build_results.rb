# frozen_string_literal: true

module Reports
  class BuildResults < BaseCommand
    attr_reader :report, :users_results, :resources, :refs, :datasheet_data, :campaign

    CLASS_MAP = {
      user_data: 'Reports::ResultTypes::User',
      external_result: 'Reports::ResultTypes::ExternalResults',
      saville_result: 'Reports::ResultTypes::SavilleResults',
      normed_factor: 'Reports::ResultTypes::NormedFactor',
      raw_factor: 'Reports::ResultTypes::RawFactor',
      zscore_factor: 'Reports::ResultTypes::ZscoreFactor',
      formula: 'Reports::ResultTypes::Formula',
      ranked_occupations: 'Reports::ResultTypes::RankedOccupations',
      survey_response: 'Reports::ResultTypes::Survey',
      mapped_value: 'Reports::ResultTypes::MappedValue',
      zscore_to_percentile: 'Reports::ResultTypes::ZscoreToPercentile',
      ref: 'Reports::ResultTypes::Ref',
      datasheet: 'Reports::ResultTypes::Datasheet',
      float: 'Reports::ResultTypes::Float',
      campaign_factor: 'Reports::ResultTypes::CampaignFactor'
    }.freeze

    def initialize(report, users_results, data = nil)
      @report = report
      @users_results = users_results
      @resources = data || ::Reports::GetDataConfigurationResources.call!(report)
      @campaign = users_results.empty? ? nil : users_results.first.campaign
      @refs = {}
    end

    def call
      calculate_refs
      result = report.flat_data_configuration.map do |data|
        CLASS_MAP[data['type'].to_sym].constantize.call(self, data)
      end
      broadcast :ok, result
    end

    def calculate_refs
      @refs = {}
      refs_list = report.data_configuration['refs'] || []
      refs_list.each do |data|
        key = data['ref_id']
        @refs[key] = CLASS_MAP[data['type'].to_sym].constantize.call(self, data)
      end
    end

    def campaign_factor_value(code)
      return nil if campaign.nil?

      campaign_factor_results[code]
    end

    def campaign_factor_results
      codes = @resources[:campaign_factor_codes]
      return nil if codes.empty?

      @campaign_factor_results ||=
        campaign.campaign_factors.joins(:campaign_factor_values).
        where(
          campaign_factor_values: { user_id: users_results.first.subject.id }, code: codes
        ).
        select(
          :name, :code, :output_type, 'campaign_factor_values.numeric_value', 'campaign_factor_values.string_value'
        ).to_a.index_by(&:code)
    end

    def datasheet_value(column_name)
      return nil if users_results.empty?

      @datasheet_data ||= users_results.first.campaign.datasheet_data(users_results.first.subject.email)
      @datasheet_data[column_name]
    end

    def find_user_result_by(assessment_id)
      @user_result_by_assessment_id ||= users_results.index_by(&:assessment_id)
      @user_result_by_assessment_id[assessment_id]
    end
  end
end
