# frozen_string_literal: true

module Reports
  class BuildResults < Rectify::Command
    attr_reader :report, :assigns, :new_structures
    LEGACY_CLASS_MAP = {
      user_data: 'Reports::ResultTypes::UserData',
      external_result: 'Reports::ResultTypes::ExternalResults',
      normed_factor: 'Reports::ResultTypes::NormedFactor',
      formula: 'Reports::ResultTypes::Formula',
      ranked_occupations: 'Reports::ResultTypes::RankedOccupations',
      survey_response: 'Reports::ResultTypes::SurveyResponse',
      assign: 'Reports::ResultTypes::Assign',
      mapped_value: 'Reports::ResultTypes::MappedValue'
    }.freeze

    NEW_CLASS_MAP = {
      user_data: 'Reports::ResultTypes::User',
      external_result: 'Reports::ResultTypes::ExternalResults',
      normed_factor: 'Reports::ResultTypes::NormedFactor',
      formula: 'Reports::ResultTypes::Formula',
      ranked_occupations: 'Reports::ResultTypes::RankedOccupations',
      survey_response: 'Reports::ResultTypes::Survey',
      assign: 'Reports::ResultTypes::Assign',
      mapped_value: 'Reports::ResultTypes::MappedValue'
    }.freeze

    def initialize(report, assigns, new_structures = false)
      @report = report
      @assigns = assigns
      @new_structures = new_structures
    end

    def call
      result = report.flat_data_configuration.map do |data|
        get_class_map[data['type'].to_sym].constantize.call(self, data)
      end
      broadcast :ok, result
    end

    def find_assign_by(assessment_id)
      @assigns_by_assessment_id ||= assigns.index_by(&:assessment_id)
      @assigns_by_assessment_id[assessment_id]
    end

    def find_user_result_by(assessment_id)
      find_assign_by(assessment_id)
    end

    def get_class_map
      new_structures ? NEW_CLASS_MAP : LEGACY_CLASS_MAP
    end

    def users_results
      assigns
    end
  end
end
