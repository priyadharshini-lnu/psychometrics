# frozen_string_literal: true

class ReimportSavilleFactors < ActiveRecord::Migration[7.1]
  def change
    Saville::ImportFactors.call!("#{Rails.root}/public/source/saville-factors.csv")
  end
end
