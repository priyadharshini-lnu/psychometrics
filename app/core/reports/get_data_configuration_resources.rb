# frozen_string_literal: true

module Reports
  class GetDataConfigurationResources < BaseCommand
    private_attr_reader :report, :configuration_sections

    def initialize(report)
      @report = report
      @configuration_sections = report.data_configuration['sections'].clone
      @configuration_sections << { 'data' => report.data_configuration['refs'] } if report.data_configuration['refs']
    end

    def call
      return broadcast :ok, {} if configuration_sections.blank?

      broadcast :ok,
                { factor_names: factor_names, questions: questions, campaign_factor_codes: campaign_factor_codes }
    end

    private

    def questions
      Question.where(id: all_question_ids).index_by(&:id)
    end

    def factor_names
      # "as factor_name" is required to avoid reading from translatoins
      Factor.
        joins("LEFT JOIN factors_aliases ON factors_aliases.factor_id = factors.id AND report_id = #{report.id}").
        select('factors.id, COALESCE(factors_aliases.name, factors.name) as factor_name').
        where(id: all_factor_ids).
        each_with_object({}) do |factor, acc|
          acc[factor.id] = factor.factor_name
        end
    end

    def campaign_factor_codes
      map_campaign_factor_codes(configuration_sections)
    end

    def map_campaign_factor_codes(data)
      codes = case data
                when Array
                  data.map { |d| map_campaign_factor_codes(d) }
                when Hash
                  data.map do |k, v|
                    if k == 'code' && data['type'] == 'campaign_factor'
                      v
                    else
                      map_campaign_factor_codes(v)
                    end
                  end
              end
      codes.nil? ? [] : codes.flatten.compact
    end

    def all_factor_ids
      map_factor_ids(configuration_sections)
    end

    def map_factor_ids(data)
      ids = case data
              when Array
                data.map { |d| map_factor_ids(d) }
              when Hash
                data.map do |k, v|
                  next v if k == 'factorId'

                  map_factor_ids(v)
                end
            end
      ids.nil? ? [] : ids.flatten.compact
    end

    def all_question_ids
      configuration_sections.map do |section|
        section['data'].filter_map { |sub_header| sub_header['questionId'] }
      end.flatten
    end
  end
end
