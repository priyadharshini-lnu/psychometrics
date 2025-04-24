# frozen_string_literal: true

class CampaignOptions < ApplicationRecord
  audited

  extend Mobility
  belongs_to :campaign

  translates :instructions, :description

  enum :identification, { passport: 0, face: 1, face_and_passport: 2 }
  enum :integration_type, { iframe: 0, ldb: 1 }
  enum :proctoring_type, { offline: 0, online: 1 }

  before_update :disable_proctoring_on_workshop_activity, if: :proctoring_enabled_changed?

  private

  def disable_proctoring_on_workshop_activity
    if proctoring_enabled == false
      self.proctoring_enabled_on_workshop_activity = false
    end
  end
end
