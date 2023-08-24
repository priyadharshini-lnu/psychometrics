# frozen_string_literal: true

class WorkshopManager < ApplicationRecord
  include WorkshopFacilitators

  belongs_to :workshop
  belongs_to :user
end
