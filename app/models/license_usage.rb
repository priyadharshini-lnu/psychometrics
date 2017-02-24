class LicenseUsage < ApplicationRecord
  belongs_to :license
  belongs_to :assigns_report
  belongs_to :client
  validates :license, :assigns_report, :client, presence: true

  after_commit :increase_license_used_number, on: :create

  def increase_license_used_number
    license.increment!(:used_number)
    Licenses::OveruseJob.perform_later(license.id) if license.used_overuse_number == 1
  end
end
