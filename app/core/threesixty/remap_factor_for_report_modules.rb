# frozen_string_literal: true

module Threesixty
  class RemapFactorForReportModules < BaseCommand
    def initialize(report, old_to_new_factor_mapping)
      @report = report
      @old_to_new_factor_mapping = old_to_new_factor_mapping
    end

    def call
      remap_multiple_factors_in_source
      remap_single_factor
    end

    private

    attr_reader :report, :old_to_new_factor_mapping

    def remap_multiple_factors_in_source
      report.modules.where("reports_modules.props -> 'source' ->>  'factors' IS NOT NULL").each do |m|
        m.props['source']['factors'] = m.props['source']['factors'].map do |factor|
          old_factor_id = factor['id']
          new_factor =  old_to_new_factor_mapping[old_factor_id]
          {
            id: new_factor.id,
            value: new_factor.id,
            parent_id: new_factor.parent_id,
            name: new_factor.name,
            alias: new_factor.aliases.find_by(report_id: report.id)&.name
          }
        end
        m.save!
      end
    end

    def remap_single_factor
      report.modules.where("reports_modules.props ->> 'factorId' IS NOT NULL", ).each do |m|
        old_factor_id = m.props['factorId']
        m.props['factorId'] = old_to_new_factor_mapping[old_factor_id].id
        m.save!
      end
    end
  end
end
