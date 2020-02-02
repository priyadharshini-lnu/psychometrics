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
  include RansackSearchableJsonField

  belongs_to :license,           inverse_of: :license_usages
  belongs_to :assigns_report,    inverse_of: :license_usages
  belongs_to :client,            inverse_of: :license_usages
  belongs_to :campaign,          inverse_of: :license_usages
  belongs_to :user,              inverse_of: :license_usages
  belongs_to :registration_code, inverse_of: :license_usages
  belongs_to :status_updated_by, class_name: 'User', foreign_key: :status_updated_by_id

  enum status: { active: 0, inactive: 1 }

  after_create :increase_license_used_number

  ransack_searchable_json_fields :subject_name, :campaign_name, :subject_email, column: :extras
  ransack_alias :subject, :subject_name_or_subject_email_or_campaign_name

  def increase_license_used_number
    license.increment!(:used_number)
    if license.in_overuse?
      client.license_msg[license_id] = I18n.t('activerecord.errors.models.license.overuse',
                                              name: license.decorate.display_name)
    end
    Licenses::OveruseJob.perform_later(license.id) if license.used_overuse_number == 1
  end
end
