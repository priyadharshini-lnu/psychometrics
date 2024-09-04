# frozen_string_literal: true

class UserDashboardSerializer < Panko::Serializer
  attributes :id, :status, :campaign_id, :pdf, :is_self, :results, :report

  has_one :user, method: :user

  delegate :campaign_id, to: :object

  def user
    UserSerializer.new.serialize(object.user)
  end

  def is_self
    object.user_id == current_user.id
  end

  def results
    context[:results]
  end

  def options
    context[:options]
  end

  def module_overrides
    TextModuleOverride.where(user_report_id: object.id)
  end

  private

  def report
    ReportSerializer.new(
      context: {
        module_overrides: module_overrides,
        include: '**'
      }
    ).serialize(context[:report])
  end

  def current_user
    context[:current_user]
  end
end
