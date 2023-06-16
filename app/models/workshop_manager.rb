# frozen_string_literal: true

class WorkshopManager < ApplicationRecord
  belongs_to :workshop
  belongs_to :user
end
