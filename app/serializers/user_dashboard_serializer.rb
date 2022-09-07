# frozen_string_literal: true

class UserDashboardSerializer < ActiveModel::Serializer
  attributes :id, :status, :campaign_id, :pdf, :is_self, :results, :approved

  has_one :user, serializer: UserSerializer
  has_one :report, serializer: ReportSerializer

  def campaign_id
    object.campaign_id
  end

  def is_self # rubocop:disable Naming/PredicateName
    object.user_id == current_user.id
  end

  def results
    @results ||= instance_options[:results]
  end

  def options
    @options ||= instance_options[:options]
  end

  def module_overrides
    TextModuleOverride.where(user_report_id: object.id)
  end

  private

  def report
    @report ||= instance_options[:report]
  end

  def current_user
    scope
  end
end
