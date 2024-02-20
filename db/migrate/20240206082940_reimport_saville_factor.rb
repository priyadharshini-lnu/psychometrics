class ReimportSavilleFactor < ActiveRecord::Migration[7.0]
  def change
    Saville::ImportFactors.call!("#{Rails.root}/public/source/saville-factors.csv")
  end
end
