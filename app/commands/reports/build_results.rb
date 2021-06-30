# frozen_string_literal: true

module Reports
  class BuildResults < BaseCommand
    attr_reader :report, :users_results, :resources

    CLASS_MAP = {
      user_data: 'Reports::ResultTypes::User',
      external_result: 'Reports::ResultTypes::ExternalResults',
      normed_factor: 'Reports::ResultTypes::NormedFactor',
      formula: 'Reports::ResultTypes::Formula',
      ranked_occupations: 'Reports::ResultTypes::RankedOccupations',
      survey_response: 'Reports::ResultTypes::Survey',
      assign: 'Reports::ResultTypes::Assign',
      mapped_value: 'Reports::ResultTypes::MappedValue'
    }.freeze

    def initialize(report, users_results, data = nil)
      @report = report
      @users_results = users_results
      @resources = data || ::Reports::GetDataConfigurationResources.call!(report)
    end

    def call
      result = report.flat_data_configuration.map do |data|
        CLASS_MAP[data['type'].to_sym].constantize.call(self, data)
      end
      broadcast :ok, result
    end

    def find_user_result_by(assessment_id)
      @assigns_by_assessment_id ||= users_results.index_by(&:assessment_id)
      @assigns_by_assessment_id[assessment_id]
    end
  end
end
