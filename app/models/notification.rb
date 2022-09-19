# frozen_string_literal: true

class Notification < ApplicationRecord
  validates :text, presence: true
  belongs_to :membership
  belongs_to :assessment
end
