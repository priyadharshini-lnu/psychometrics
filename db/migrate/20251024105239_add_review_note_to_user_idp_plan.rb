# frozen_string_literal: true

class AddReviewNoteToUserIdpPlan < ActiveRecord::Migration[8.0]
  def change
    add_column :user_idp_plans, :review_note, :text
  end
end
