# frozen_string_literal: true

class CommunicationsUser < ApplicationRecord
  belongs_to :user
  belongs_to :communication
end
