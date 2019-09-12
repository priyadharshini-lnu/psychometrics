# frozen_string_literal: true

module Reports
  class BuildResults < Rectify::Command
    attr_reader :report, :assigns
    CLASS_MAP = {
      user_data: 'Reports::ResultTypes::UserData',
      external_result: 'Reports::ResultTypes::ExternalResults',
      normed_factor: 'Reports::ResultTypes::NormedFactor',
      formula: 'Reports::ResultTypes::Formula',
      ranked_occupations: 'Reports::ResultTypes::RankedOccupations'
    }.freeze

    def initialize(report, assigns)
      @report = report
      @assigns = assigns
    end

    def call
      result = report.flat_data_configuration.map do |data|
        CLASS_MAP[data['type'].to_sym].constantize.call(self, data)
      end
      broadcast :ok, result
    end

    def find_assign_by(assessment_id)
      @assigns_by_assessment_id ||= assigns.index_by(&:assessment_id)
      @assigns_by_assessment_id[assessment_id]
    end
  end
end
