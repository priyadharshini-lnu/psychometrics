# frozen_string_literal: true

class CommunicationsUser < ApplicationRecord
  audited

  belongs_to :user
  belongs_to :communication
end
