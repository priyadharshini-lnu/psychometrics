# frozen_string_literal: true

class AssessmentDecorator < BaseDecorator
  def category
    I18n.t("activerecord.attributes.assessment.categories.#{Assessment::CATEGORIES.key(object.category)}")
  end

  def dashboard_category
    if [Assessment::MINDMILL, Assessment::HOGAN].include?(object.category)
      Assessment::PSYCHOMETRIC
    else
      object.category
    end
  end

  def description
    object.description || I18n.t('assigns.decorator.no_description')
  end

  def name
    if object.finished?
      "#{object.name} (#{I18n.t('activerecord.attributes.assessment.statuses.finished')})"
    else
      object.name
    end
  end

  # TODO: Paul quick fix
  delegate :timing, to: :object

  def anonym_link?(client)
    assessments_client = client.assessments_clients.find_by(assessment_id: object.id)

    assessments_client.enable_universal_links? && assessments_client.assessment_key
  end

  def link_to_anonym_link(client)
    url = anonym_link_for(client)
    h.link_to url.truncate(30), url
  end

  def anonym_link_for(client)
    assessments_client = client.assessments_clients.find_by(assessment_id: object.id)

    options = {
      assessment_key: assessments_client.assessment_key,
      domain: Settings.domain,
      subdomain: client.project.subdomain
    }

    h.anonym_assessment_pass_url(options)
  end

  def anonym_link_for_campaign(campaign)
    campaign_assessment = campaign.campaign_assessments.find_by(assessment_id: object.id)

    options = {
      assessment_key: campaign_assessment.assessment_key,
      domain: Settings.domain,
      subdomain: campaign.project.subdomain
    }

    h.anonym_pass_url(options)
  end

  def universal_link_regeneration_confirmation
    {
      title: I18n.t('administration.clients.assessments.resource.confirmations.universal_links.regeneration.title'),
      body: I18n.t('administration.clients.assessments.resource.confirmations.universal_links.regeneration.body')
    }.to_json
  end

  def clients_names
    object.clients.
      map { |client| client.decorate.display_name }.
      join(', ')
  end

  # TODO: refactor db, add completion
  def completion_percent
    assign = object.assigns.where(membership_id: h.pundit_user[:current_membership].id).take
    return 100 if assign.completed?

    answered = assign.results&.size || 0
    total = object.questions&.size
    return 0 if total.nil? || total.zero?

    result = (100 * answered) / total

    # TODO: (atanych): Store progress bar in DB and calculate only on frontend.
    99 if result > 99
    result
  end

  def clients_by_report_families
    tte_ids = Client.by_report_family_assessment(object).enabled.roots.ids
    h.policy_scope(Client).where(tte_id: tte_ids).end_level.map { |c| [c.id, c.decorate.display_name_with_parent] }
  end

  def type
    I18n.t("activerecord.attributes.assessment.types.#{Assessment::TYPES.key(object.type)}")
  end

  # Returns a round image or circle with the specified color and two letters of the name
  #
  def icon
    return h.image_tag(object.icon_url(:thumb), class: 'img-circle icon-circle') if object.icon?

    h.content_tag(:div, object.name.first(2), class: 'icon-circle', style: "background-color: #{object.icon_color}")
  end
end
