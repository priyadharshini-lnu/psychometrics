# frozen_string_literal: true

# This file is not being used, but if we remove this it causes exception due to json-resource gem checking for this file
class Api::V2::Administration::AIScoringApprovalSettingResource < Api::V2::Administration::BaseResource
  model_name 'AI::ScoringApprovalSetting'

  attributes :assessor_ids, :approver_ids, :approval_notification_user_ids, :assessors, :approvers,
             :approval_notification_users, :allow_bulk_approve, :allow_bulk_approve_scores,
             :do_not_send_notifications, :send_digest_emails, :digest_delivery_mode, :digest_frequency,
             :digest_weekdays, :digest_time, :digest_timezone, :allow_one_level_approve

  has_one :campaign
  has_one :assessment

  before_create -> { @model.campaign = context[:campaign] }

  def fetchable_fields
    super - %i[assessor_ids approver_ids approval_notification_user_ids]
  end

  def self.creatable_fields(_)
    super - %i[qcs approvers campaign]
  end

  def self.updatable_fields(values)
    creatable_fields(values)
  end

  def self.records(opts)
    super.where(campaign_id: opts.dig(:context, :campaign).id)
  end

  def assessors
    user_details(assessor_ids)
  end

  def approvers
    user_details(approver_ids)
  end

  def approval_notification_users
    user_details(approval_notification_user_ids)
  end

  def digest_time
    return nil unless @model.digest_time

    @model.digest_time.strftime('%I:%M %p')
  end

  def user_details(user_ids)
    user_ids.filter_map do |id|
      user = users[id]
      next unless user

      user.slice(:email).merge(name: user.decorate.display_name, id: user.id.to_s)
    end
  end

  def users
    @users ||= User.where(id: assessor_ids + approver_ids + approval_notification_user_ids).index_by(&:id)
  end
end
