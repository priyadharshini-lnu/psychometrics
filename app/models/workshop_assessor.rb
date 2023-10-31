# frozen_string_literal: true

class WorkshopAssessor < ApplicationRecord
  audited
  include WorkshopFacilitators

  belongs_to :workshop
  belongs_to :user

  after_create -> { Assessor.find_or_create_by!(campaign_id: workshop.campaign_id, user_id: user.id) }
end
