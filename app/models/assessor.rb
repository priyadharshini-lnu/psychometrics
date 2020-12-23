# frozen_string_literal: true

class Assessor < ApplicationRecord
  belongs_to :user
  belongs_to :campaign
end
