# frozen_string_literal: true

class WorkshopAssessor < ApplicationRecord
  belongs_to :workshop
  belongs_to :user
end
