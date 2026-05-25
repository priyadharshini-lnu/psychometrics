# frozen_string_literal: true

class UserIdpSkill < ApplicationRecord
  include SoftDelete

  MAX_RATING = 5

  has_paper_trail if: proc { |obj|
    (obj.user_idp_plan.saved_change_to_approval_status? &&
      %w[approved pending_approval].include?(obj.user_idp_plan.approval_status)) ||
      %w[pending_approval in_review draft].include?(obj.user_idp_plan.approval_status)
  }

  belongs_to :user_idp_plan, autosave: true
  belongs_to :skill
  include Tenantable

  tenant_source :user_idp_plan

  has_one :user, through: :user_idp_plan
  has_many :user_idp_development_actions, dependent: :destroy
  has_many :development_actions, through: :skill
  validates :initial_rating, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: MAX_RATING },
                             allow_blank: true

  scope :private_skills, -> { where(private: true) }
  scope :public_skills, -> { where(private: false) }

  def toggle_privacy!
    toggle!(:private)
  end

  def public?
    !private
  end
end
