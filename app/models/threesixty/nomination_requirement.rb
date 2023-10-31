# frozen_string_literal: true

module Threesixty
  class NominationRequirement < ApplicationRecord
    audited

    belongs_to :threesixty_campaign, class_name: 'Threesixty::Campaign'
  end
end
