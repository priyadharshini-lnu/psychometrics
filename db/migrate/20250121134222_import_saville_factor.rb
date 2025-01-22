# frozen_string_literal: true

class ImportSavilleFactor < ActiveRecord::Migration[7.1]
  def change
    # rubocop:disable CustomRubocops/AvoidActiveRecordInMigrations
    Saville::ImportFactors.call!(Rails.public_path.join('source/saville-factors.csv'))
    # rubocop:enable CustomRubocops/AvoidActiveRecordInMigrations
  end
end
