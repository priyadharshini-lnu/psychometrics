# frozen_string_literal: true

class UserSavedFilter < ApplicationRecord
  MAX_FILTERS_COUNT_PER_RESOURCE_TYPE = 10

  belongs_to :user

  validates :name, presence: true
  validates :filter_params, presence: true
  validates :resource_type, presence: true

  before_save :ensure_single_favorite
  before_create :make_first_filter_favorite
  after_destroy :promote_oldest_to_favorite_if_needed

  scope :by_resource_type, ->(type) { where(resource_type: type) }
  scope :favorites, -> { where(favorite: true) }

  enum :resource_type, {
    report_approvals_all: 'report_approvals_all',
    report_approvals_my_tasks: 'report_approvals_my_tasks',
    report_approvals_approved: 'report_approvals_approved'
  }

  def self.ransackable_attributes(_auth_object = nil)
    %w[id name resource_type favorite]
  end

  private

  def ensure_single_favorite
    if favorite
      UserSavedFilter.where(user: user, resource_type: resource_type).
        where.not(id: id).
        update_all(favorite: false)
    end
  end

  def make_first_filter_favorite
    if user.user_saved_filters.where(resource_type: resource_type).empty?
      self.favorite = true
    end
  end

  def promote_oldest_to_favorite_if_needed
    return unless favorite

    oldest_filter = UserSavedFilter.where(user: user, resource_type: resource_type).
                    order(created_at: :asc).
                    first

    oldest_filter&.update(favorite: true)
  end
end
