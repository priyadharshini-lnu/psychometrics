# frozen_string_literal: true

class AddDownloadReportPermission < ActiveRecord::Migration[5.2]
  def change
    MembershipGrant.where("data->'results' ?& ARRAY['view_report']").update_all(
      <<-SQL.squish
        data = jsonb_set(
        data,
        ARRAY['results'],
        COALESCE(data->'results', '[]'::jsonb) || array_to_json(ARRAY['download_report'])::jsonb)
      SQL
    )
  end
end
