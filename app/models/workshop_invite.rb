# frozen_string_literal: true

class WorkshopInvite < ApplicationRecord
  audited

  extend Mobility

  belongs_to :campaign
  belongs_to :campaign_assessment_group
  has_many :workshop_invited_subjects, dependent: :destroy
  has_and_belongs_to_many :workshops, dependent: :destroy
  has_many :workshop_invite_logs, dependent: :destroy
  has_many :communication_emails, dependent: :destroy

  translates :title, :description

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

  def end_user_url
    Utility::Url.generate(:invites_url, subdomain: campaign.project.subdomain)
  end

  def self.ransackable_attributes(_auth_object = nil)
    %w[id title campaign_id]
  end
end
