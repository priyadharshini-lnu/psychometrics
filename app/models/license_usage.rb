# frozen_string_literal: true

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
  belongs_to :license,           inverse_of: :license_usages
  belongs_to :assigns_report,    inverse_of: :license_usages
  belongs_to :client,            inverse_of: :license_usages
  belongs_to :campaign,          inverse_of: :license_usages
  belongs_to :user,              inverse_of: :license_usages
  belongs_to :registration_code, inverse_of: :license_usages

  after_create :increase_license_used_number

  def increase_license_used_number
    license.increment!(:used_number)
    if license.in_overuse?
      client.license_msg[license_id] = I18n.t('activerecord.errors.models.license.overuse',
                                              name: license.decorate.display_name)
    end
    Licenses::OveruseJob.perform_later(license.id) if license.used_overuse_number == 1
  end
end
