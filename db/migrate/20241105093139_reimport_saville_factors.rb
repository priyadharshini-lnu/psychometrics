# frozen_string_literal: true

class ReimportSavilleFactors < ActiveRecord::Migration[7.1]
  def change
    # rubocop:disable CustomRubocops/AvoidActiveRecordInMigrations, Rails/FilePath
    Saville::ImportFactors.call!("#{Rails.root}/public/source/saville-factors.csv")
    # rubocop:enable CustomRubocops/AvoidActiveRecordInMigrations, Rails/FilePath
  end
end
