# frozen_string_literal: true

class Api::V2::Administration::WorkshopSubjectResource < Api::V2::Administration::BaseResource
  attributes :attendance_status, :completion_status, :attended, :preworks, :workshop_activities,
             :language, :late_duration
  delegate :full_name, :email, :photo_url, to: :user

  has_one :user

  ransack_filters %i[user_full_name_or_user_email_cont]

  before_update do
    @model.attendance_status = 'no_show' if @model.attended == true
  end

  def language
    @model.preferred_language || @model.user.user_profile.locale
  end

  def self.records(opts = {})
    Api::Administration::WorkshopSubjectPolicy::Scope.new(
      opts[:context][:user], WorkshopSubject, campaign_id: opts[:context][:params][:campaign_id]
    ).resolve.where(
      workshop_id: opts[:context][:params][:workshop_id]
    )
  end

  def preworks
    return '0/0' unless campaign_preworks[user_id]

    "#{campaign_preworks[user_id]['completed']}/#{campaign_preworks[user_id]['total']}"
  end

  def workshop_activities
    return '0/0' unless campaign_workshop_activity[user_id]

    "#{campaign_workshop_activity[user_id]['completed']}/#{campaign_workshop_activity[user_id]['total']}"
  end

  def meta_details
    {
      assessor_assessments: lambda {
        campaigns_assessor_assessments
      },
      assessors: lambda {
        assessors
      }
    }
  end

  private

  def assessors
    [].tap do |assessors|
      @model.workshop.workshop_assessors.each do |assessor|
        assessors << {
          id: assessor.id,
          name: assessor.user.name,
          photo_url: assessor.user.photo_url
        }
      end
    end
  end

  def campaigns_assessor_assessments
    [].tap do |assessments|
      @model.campaign.campaign_assessor_assessments.each do |campaign_assessor_assessment|
        assessments << {
          id: campaign_assessor_assessment.id,
          name: campaign_assessor_assessment.assessment.name
        }
      end
    end
  end

  def campaign_preworks
    @campaign_preworks ||= Campaigns::GetPreworks.call(context[:campaign].id)[:ok]
  end

  def campaign_workshop_activity
    @campaign_workshop_activity ||= Campaigns::GetWorkshopActivity.call(context[:campaign].id)[:ok]
  end
end
