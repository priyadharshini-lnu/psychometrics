# frozen_string_literal: true

module EndUser
  class ShortCampaignSerializer < ActiveModel::Serializer
    attributes :id, :name, :type, :status, :completion_percentage

    def completion_percentage
      uas = instance_options[:current_user].user_assessments.where(campaign: object)
      completed_count = uas.count(&:completed?)
      return 0 unless uas.length.positive?

      (completed_count / uas.length.to_f) * 100
    end
  end
end
