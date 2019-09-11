# frozen_string_literal: true

namespace :aliases do
  desc 'Generate aliases for existing factors.'
  task create_factors_aliases: :environment do
    ActiveRecord::Base.transaction do
      Report.find_each do |report|
        report.factors_through_factors_aliases << Factor.where(dimension_id: report.dimension_ids)
      end
    end
  end
end
