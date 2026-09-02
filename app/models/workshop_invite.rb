# frozen_string_literal: true

class WorkshopInvite < ApplicationRecord
  audited

  extend Mobility

  belongs_to :campaign
  belongs_to :campaign_assessment_group
  include Tenantable

  has_many :workshop_invited_subjects, dependent: :destroy
  has_and_belongs_to_many :workshops, dependent: :destroy
  has_many :workshop_invite_logs, dependent: :destroy
  has_many :communication_emails, dependent: :destroy

  translates :title, :description

  scope :filterable_fields, lambda { |search_term|
    search_term = search_term.to_s
    if (search_term !~ /\D/) && search_term.present?
      where(
        'id = ? OR name ILIKE ? OR EXISTS (
          SELECT 1 FROM workshop_invite_translations
          WHERE workshop_invite_id = id AND title ILIKE ? AND locale = ?
        )',
        search_term,
        "%#{search_term}%",
        "%#{search_term}%",
        I18n.locale.to_s
      )
    else
      where(
        "workshop_invites.name ILIKE ? OR EXISTS (
          SELECT 1 FROM workshop_invite_translations
          WHERE workshop_invite_id = workshop_invites.id
            AND title ILIKE ?
            AND locale = ?
        )",
        "%#{search_term}%",
        "%#{search_term}%",
        I18n.locale.to_s
      )
    end
  }

  RESTRICTED_SUBJECTS = 300

  def available_workshops_date_and_id
    [].tap do |available_dates|
      workshops.sort_by(&:start_time).each do |workshop|
        if workshop.booked_seats != workshop.total_seats && !workshop.scheduling_lead_time_passed?
          available_dates << { id: workshop.id, date: workshop.start_time.iso8601 }
        end
      end
    end
  end

  def next_bookable_workshop
    workshops.
      select { |w| w.booked_seats < w.total_seats && !w.scheduling_lead_time_passed? }.
      min_by(&:start_time)
  end

  def next_future_workshop
    workshops.
      select { |w| w.start_time > Time.current }.
      min_by(&:start_time)
  end

  def end_user_url
    Utility::Url.generate(:invites_url, subdomain: campaign.project.subdomain)
  end

  def self.ransackable_attributes(_auth_object = nil)
    %w[id title name campaign_id]
  end

  def self.ransackable_scopes(_auth_object = nil)
    %i[filterable_fields]
  end
end
