# frozen_string_literal: true

class UsersReport < ApplicationRecord
  belongs_to :user
  belongs_to :report
  belongs_to :campaign

  def threesixty_subject
    campaign.subjects.find_by(user_id: user_id)
  end

  enum status: { not_prepared: 0, prepared: 1 }
end
