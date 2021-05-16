# frozen_string_literal: true

module Api
  module V1
    module Campaigns
      class CreateForm < UpdateForm
        validates :name, :status, presence: true
        validates :duration, presence: true, if: -> { fixed_time }
      end
    end
  end
end
