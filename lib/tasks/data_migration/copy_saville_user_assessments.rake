# frozen_string_literal: true

require 'csv'

namespace :data_migration do
  desc 'Migrate Saville user assessments from one project to another'

  task :copy_saville_user_assessments, %i[csv_url row] => [:environment] do |_, args|
    ActiveRecord::Base.logger = Rails.logger = Logger.new($stdout)

    Assessments::DataMigration::CopyAssessmentsFromCsv.call!('saville', args[:csv_url], args[:row])
  end
end
