# == Schema Information
#
# Table name: license_usages
#
#  id                :integer          not null, primary key
#  license_id        :integer
#  assigns_report_id :integer
#  client_id         :integer          not null
#

class LicenseUsage < ApplicationRecord
  belongs_to :license
  belongs_to :assigns_report
  belongs_to :client
  validates :license, :assigns_report, :client, presence: true

  after_commit :increase_license_used_number, on: :create

  def increase_license_used_number
    license.increment!(:used_number)
    client.license_msg[license_id] = I18n.t('activerecord.errors.models.license.overuse', name: license.decorate.display_name) if license.in_overuse?
    Licenses::OveruseJob.perform_later(license.id) if license.used_overuse_number == 1
  end
end
