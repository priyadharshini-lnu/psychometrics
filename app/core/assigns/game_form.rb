# frozen_string_literal: true

module Assigns
  class GameForm < Rectify::Form
    attribute :group_id, String
    attribute :answers, Hash

    validates :group_id, :answers, presence: true
  end
end
