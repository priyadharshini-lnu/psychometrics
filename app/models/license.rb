# frozen_string_literal: true

class License < ApplicationRecord
  audited

  self.inheritance_column = :_type_disabled

  belongs_to :client, counter_cache: :licenses_count
  belongs_to :report_family
  has_many :license_usages # on delete cascade

  validates :start_date, :end_date, presence: true, allow_nil: false
  validates :client, presence: true, allow_nil: false
  validates :overuse_number, :used_number,
            numericality: { greater_than_or_equal_to: 0 }
  validates :number, numericality: { greater_than_or_equal_to: 1 }
  validates :report_family_id, presence: true, if: :type_common?
  validate :used_number_validation
  validate :license_expire_validation

  scope :with_report_family, lambda { |report_family_id|
    where(report_family_id: report_family_id)
  }
  scope :active, -> { where(disabled: false) }
  scope :available, lambda {
                      active.
                        where('end_date >= :date and start_date <= :date and number + overuse_number > used_number',
                              date: Time.zone.today)
                    }

  enum :type, { common: 0, threesixty: 1, proctoring: 2, idp: 3, ai_assistant: 4 }, prefix: :type

  def self.ransackable_attributes(_auth_object = nil)
    %w[id]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[report_family]
  end

  def used_overuse_number
    number >= used_number ? 0 : used_number - number
  end

  def in_overuse?
    used_overuse_number.positive?
  end

  def enough_licenses?
    return false if end_date < Time.zone.today || start_date > Time.zone.today

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

  def enough_license_credits?(credits)
    number + overuse_number - used_number >= credits
  end

  private

  def license_expire_validation
    if end_date && start_date && (end_date <= start_date)
      errors.add(:end_date, :invalid)
    end
  end

  def used_number_validation
    errors.add(:used_number, :overused) if (number + overuse_number - used_number).negative?
  end
end
