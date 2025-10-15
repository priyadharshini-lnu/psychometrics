# frozen_string_literal: true

class LicenseUsage < ApplicationRecord
  audited

  include RansackSearchableJsonField

  belongs_to :license,           inverse_of: :license_usages
  belongs_to :client,            inverse_of: :license_usages
  belongs_to :project, class_name: 'Client', optional: true
  belongs_to :project_license, optional: true
  belongs_to :campaign,          inverse_of: :license_usages
  belongs_to :user,              inverse_of: :license_usages
  belongs_to :registration_code, inverse_of: :license_usages
  belongs_to :status_updated_by, class_name: 'User'
  belongs_to :consumer, polymorphic: true

  enum :status, { active: 0, inactive: 1 }

  after_create :increase_license_used_number, unless: -> { license.type_proctoring? }

  ransack_searchable_json_fields :subject_name, :campaign_name, :subject_email, column: :extras
  ransack_alias :subject, :subject_name_or_subject_email_or_campaign_name
  ransacker :status, formatter: proc { |v| statuses[v] } do |parent|
    parent.table[:status]
  end

  def self.ransackable_attributes(_auth_object = nil)
    %w[id subject_name campaign_name subject_email status]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[client campaign user]
  end

  def increase_license_used_number
    license.increment!(:used_number)
    if license.in_overuse?
      client.license_msg[license_id] = I18n.t('activerecord.errors.models.license.overuse',
                                              name: license.decorate.display_name)
    end

    if project.present?
      project_license = license.project_licenses.enabled.find_by!(project: project)
      project_license&.increment!(:used_number)
    end

    Licenses::OveruseJob.perform_later(license.id) if license.used_overuse_number == 1
  end
end
