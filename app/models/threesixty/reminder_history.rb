# frozen_string_literal: true

module Threesixty
  class ReminderHistory < ApplicationRecord
    belongs_to :threesixty_campaign, class_name: "Threesixty::Campaign"
    belongs_to :user
  end
end
