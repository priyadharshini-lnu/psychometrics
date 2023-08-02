# frozen_string_literal: true

class Api::V2::Administration::WorkshopSubjectResource < Api::V2::Administration::BaseResource
  attributes :status, :attended, :preworks, :workshop_activities
  delegate :full_name, :email, to: :user

  has_one :user

  ransack_filters %i[user_full_name_or_user_email_cont]

  def self.records(opts = {})
    ::Pundit.policy_scope!(opts[:context][:user], [:api, :administration, WorkshopSubject]).where(
      workshop_id: opts[:context][:params]['workshop_id']
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

  private

  def campaign_preworks
    @campaign_preworks ||= Campaigns::GetPreworks.call(context[:campaign].id)[:ok]
  end

  def campaign_workshop_activity
    @campaign_workshop_activity ||= Campaigns::GetWorkshopActivity.call(context[:campaign].id)[:ok]
  end
end
