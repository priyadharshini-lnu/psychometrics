# frozen_string_literal: true

module UsersResults
  class UpdatingForm < Rectify::Form
    attribute :status, Integer
    attribute :embedded_data, Hash, default: nil
    attribute :norm_id, Integer, default: nil
    attribute :answers, Hash, default: nil
    attribute :step, Integer, default: 0
  end
end
