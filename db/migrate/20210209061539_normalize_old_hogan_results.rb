# frozen_string_literal: true

class NormalizeOldHoganResults < ActiveRecord::Migration[5.2]
  def change
    AssignsReport.all.map do |ar|
      hogan_score = Hogan::NormalizeOldResults.call!(ar.hogan_score)
      ar.update!(hogan_score: hogan_score)
    end
    UsersResult.where("external_results != '{}'").all.map do |res|
      external_results = Hogan::NormalizeOldResults.call!(res.external_results)
      res.update!(external_results: external_results)
    end
  end
end
