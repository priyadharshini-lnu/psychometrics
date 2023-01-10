# frozen_string_literal: true

class AgileEvent < ApplicationRecord
  belongs_to :assign
  belongs_to :users_result
end
