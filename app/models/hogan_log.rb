# frozen_string_literal: true

class HoganLog < ApplicationRecord
  belongs_to :user
  belongs_to :campaign
  has_one :hogan_credential, foreign_key: :participant_id, primary_key: :participant_id
end
