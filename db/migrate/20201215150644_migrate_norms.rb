# frozen_string_literal: true

class MigrateNorms < ActiveRecord::Migration[5.2]
  def change
    Norm.where(norm_type: :five_scale).includes(:factors_norms).find_each do |eti_norm|
      yti_norm = eti_norm.clone
      yti_norm.update(name: "#{eti_norm.name} - YTI")
      eti_norm.update(name: "#{eti_norm.name} - ETI")

      eti_norm.factors_norms.where(type: 'yti').delete_all
      yti_norm.factors_norms.where(type: 'eti').delete_all

      Assign.where("assigns.norm_data->>'type' = 'YTI' and assigns.norm_data->>'id' = '#{eti_norm.id}'").
        update_all(norm_data: { 'id' => yti_norm.id.to_s })

      UsersResult.where(norm_type: 'YTI', norm_id: eti_norm.id).
        update_all(norm_id: yti_norm.id)

      CampaignAssessment.where(norm_type: 'YTI', norm_id: eti_norm.id).
        update_all(norm_id: yti_norm.id)
    end
  end
end
