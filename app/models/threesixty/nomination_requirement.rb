# frozen_string_literal: true

module Threesixty
  class NominationRequirement < ApplicationRecord
    belongs_to :threesixty_campaign, class_name: 'Threesixty::Campaign'
  end
end
