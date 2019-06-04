# frozen_string_literal: true

class Relationship < ApplicationRecord
  self.inheritance_column = :_type_disabled

  belongs_to :campaign
  enum type: { global: 0, campaign: 1 }
  enum assign_type: { manual: 0, automatic: 1 }

  def self.self_relationship
    Relationship.find_by(name: 'Self')
  end
end
