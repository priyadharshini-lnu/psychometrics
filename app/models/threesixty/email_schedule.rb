# frozen_string_literal: true

class Threesixty::EmailSchedule < ApplicationRecord
  belongs_to :threesixty_campaign, class_name: "Threesixty::Campaign"
end
