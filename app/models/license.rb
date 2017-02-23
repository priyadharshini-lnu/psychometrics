class License < ApplicationRecord
  belongs_to :client, counter_cache: true
  belongs_to :report_family

  validates :client, :start_date, :end_date, presence: true, allow_nil: false
  validates :number, :overuse_number, :used_number,
            numericality: { greater_than_or_equal_to: 0 }
  validates :report_family_id, presence: true
  validate :license_expire_validation

  scope :with_report_family, lambda { |report_family_id|
    where(report_family_id: report_family_id)
  }

  def used_overuse_number
    number >= used_number ? 0 : used_number - number
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

  private

  def license_expire_validation
    if end_date && start_date
      errors.add(:end_date, :invalid) if end_date <= start_date
    end
  end
end
