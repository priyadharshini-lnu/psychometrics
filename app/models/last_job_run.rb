# frozen_string_literal: true

class LastJobRun < ApplicationRecord
  before_create :set_default_timestamps

  validates :name, presence: true

  private

  def set_default_timestamps
    self.started_at ||= Time.zone.now
    self.finished_at ||= Time.zone.now
  end
end
