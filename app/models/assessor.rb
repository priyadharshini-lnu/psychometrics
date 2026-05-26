# frozen_string_literal: true

class Assessor < ApplicationRecord
  audited

  belongs_to :user
  belongs_to :campaign
  include Tenantable

  has_many :user_assessments, primary_key: :user_id, foreign_key: :evaluator_id

  scope :sort_by_full_name_asc, -> { joins(:user).merge(User.sort_by_full_name_asc) }
  scope :sort_by_full_name_desc, -> { joins(:user).merge(User.sort_by_full_name_desc) }

  scope :filterable_fields, lambda { |query|
    joins(:user).where('users.first_name ILIKE :query OR users.last_name ILIKE :query OR users.email ILIKE :query',
                       query: "%#{query}%")
  }

  def self.ransackable_attributes(_auth_object = nil)
    %w[id campaign_id last_name user_id created_at]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[user]
  end

  def self.ransackable_scopes(_auth_object = nil)
    %i[filterable_fields]
  end
end
