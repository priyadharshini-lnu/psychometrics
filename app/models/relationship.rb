# frozen_string_literal: true

class Relationship < ApplicationRecord

  belongs_to :campaign
  self.inheritance_column = :_type_disabled
  enum type: { global: 0, campaign: 1 }
end
