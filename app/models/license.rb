# frozen_string_literal: true

# == Schema Information
#
# Table name: licenses
#
#  id               :integer          not null, primary key
#  number           :integer          default(0)
#  overuse_number   :integer          default(0)
#  used_number      :integer          default(0)
#  client_id        :integer
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  end_date         :date             not null
#  start_date       :date             not null
#  report_family_id :integer          not null
#

class License < ApplicationRecord
  self.inheritance_column = :_type_disabled

  belongs_to :client, counter_cache: true
  belongs_to :report_family
  has_many :license_usages # on delete cascade

  validates :client, :start_date, :end_date, presence: true, allow_nil: false
  validates :overuse_number, :used_number,
            numericality: { greater_than_or_equal_to: 0 }
  validates :number, numericality: { greater_than_or_equal_to: 1 }
  validates :number, numericality: { greater_than_or_equal_to: :used_number }, unless: :new_record?
  validates :report_family_id, presence: true
  validate :license_expire_validation

  scope :with_report_family, lambda { |report_family_id|
    where(report_family_id: report_family_id)
  }
  scope :active, -> { where(disabled: false) }
  scope :available, lambda {
                      active.
                        where('end_date >= :date and start_date <= :date and number + overuse_number > used_number',
                              date: Date.today)
                    }

  enum type: { common: 0, threesixty: 1 }, _prefix: :type

  def used_overuse_number
    number >= used_number ? 0 : used_number - number
  end

  def in_overuse?
    used_overuse_number > 0
  end

  def enough_licenses?
    return false if end_date < Date.today || start_date > Date.today

    number + overuse_number > used_number
  end

  # If license became unlimited
  #   Then we set license counter to zero
  def set_licenses_to_zero
    self.number = 0
    self.overuse_number = 0
    self.used_number = 0
  end

  def used_by(client)
    license_usages.joins(assigns_report: { assign: :membership }).
      where(assigns_report: { assign: { memberships: { client_id: [client.subtree_ids].flatten } } }).
      size
  end

  private

  def license_expire_validation
    if end_date && start_date
      errors.add(:end_date, :invalid) if end_date <= start_date
    end
  end
end
