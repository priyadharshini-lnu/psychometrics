# frozen_string_literal: true

class Relationship < ApplicationRecord
  self.inheritance_column = :_type_disabled

  belongs_to :campaign
  enum type: { global: 0, campaign: 1 }
end
