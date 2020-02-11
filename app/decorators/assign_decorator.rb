# frozen_string_literal: true

class AssignDecorator < BaseDecorator
  private_attr_reader :original_assign

  def initialize(object, options = {})
    @original_assign = object
    object = object.project_assign || object
    super
  end

  def created_at
    I18n.l object.created_at, format: :date
  end

  def completed_at_with_desc
    if object.completed_at
      return I18n.t('assigns.decorator.completed', date: I18n.l(object.completed_at, format: :date))
    end

    I18n.t('assigns.decorator.not_completed')
  end

  def completed_at
    I18n.l(object.completed_at, format: :date) if object.completed_at
  end

  def started_at
    I18n.l(object.started_at, format: :date) if object.started_at
  end

  def display_name
    'Assign'
  end

  def status
    I18n.t("activerecord.attributes.assign.statuses.#{object.status}")
  end

  def delete_confirmation
    name = original_assign.assessment.try(:name)
    items = original_assign.reports.map { |report| "<li>#{report.name}</li>" }.join('')
    message_body = unless items.blank?
                     I18n.t(
                       "administration.clients.users.#{i18n}.resource.confirms.assessment.detach.body", items: items
                     )
                   end

    {
      title: I18n.t("administration.clients.users.#{i18n}.resource.confirms.assessment.detach.title", name: name),
      body: message_body
    }.to_json
  end
end
