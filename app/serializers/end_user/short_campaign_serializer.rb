# frozen_string_literal: true

module EndUser
  class ShortCampaignSerializer < ActiveModel::Serializer
    attributes :id, :name, :type, :status, :completion_percentage, :progress_status, :user_reports_available,
               :description, :start_date, :timing

    delegate :start_date, to: :object

    def completion_percentage
      uas = instance_options[:current_user].user_assessments.where(campaign: object)
      completed_count = uas.count(&:completed?)
      return 0 unless uas.length.positive?

      (completed_count / uas.length.to_f) * 100
    end

    def progress_status
      campaign_user.completion_status
    end

    def user_reports_available
      object.user_reports.exists?(user_id: instance_options[:current_user], user_access: true)
    end

    def description
      object.campaign_options.description
    end

    def timing
      object.fixed_timed? ? object.fixed_time_duration : nil
    end

    def campaign_user
      object.campaign_users.find_by(user_id: instance_options[:current_user])
    end
  end
end
