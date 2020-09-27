# frozen_string_literal: true

class CampaignUser < ApplicationRecord
  enum completed_via: { user: 0, timed_out: 1 }
  enum completion_status: { new: 0, in_progress: 1, completed: 2 }, _suffix: :campaign

  belongs_to :user
  belongs_to :campaign
  has_one :project, through: :campaign
  has_many :evaluation_results, through: :user
  has_many :user_assessments, through: :user
  has_many :user_reports, through: :user

  def disabled
    !active
  end
end
