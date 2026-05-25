# frozen_string_literal: true

class Relationship < ApplicationRecord
  audited

  self.inheritance_column = :_type_disabled

  ASSESSOR = 'Assessor'
  SELF = 'Self'

  belongs_to :campaign
  include Tenantable

  has_many :user_assessments, dependent: :restrict_with_exception

  enum :type, { global: 0, campaign: 1 }
  enum :assign_type, { manual: 0, automatic: 1 }

  def self.self_relationship
    Relationship.find_by(name: SELF, type: :global)
  end

  def self.manager_relationship
    Relationship.find_by(name: 'Manager', type: :global)
  end

  def self.assessor_relationship
    Relationship.find_by(name: ASSESSOR, type: :global)
  end
end
