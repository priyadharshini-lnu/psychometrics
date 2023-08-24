# frozen_string_literal: true

class WorkshopAssessor < ApplicationRecord
  include WorkshopFacilitators

  belongs_to :workshop
  belongs_to :user
end
