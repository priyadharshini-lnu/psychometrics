# frozen_string_literal: true

class ImportSavilleImport < ActiveRecord::Migration[5.2]
  def change
    Saville::ImportFactors.call!("#{Rails.root}/public/source/saville-factors.csv")
  end
end
