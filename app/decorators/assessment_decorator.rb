class AssessmentDecorator < BaseDecorator
  def category
    I18n.t("activerecord.attributes.assessment.categories.#{Assessment::CATEGORIES.key(object.category)}")
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
  def timing
    object.timing
    # object.timing ? "- #{object.timing}" : ''
  end

  def anonym_link_for(client)
    hasids = Hashids.new(ENV['HASHIDS_SALT'], Settings.hashids_length.anonym)
    url = h.anonym_assessment_pass_url(client_id: hasids.encode(client.id),
                                       assessment_id: hasids.encode(object.id),
                                       domain: Settings.domain,
                                       subdomain: client.subdomain)
    h.link_to(url, url)
  end

  def client_name
    if object.owner_id
      helpers.link_to(object.owner.name, h.administration_client_projects_path(object.owner_id))
    else
      I18n.t('administration.tte')
    end
  end

  def clients_names
    object.clients.
        map { |client| client.decorate.display_name }.
        join(', ')
  end

  # todo refactor db, add completion
  def completion_percent
    assing = object.assigns.where(membership_id: h.pundit_user[:current_membership].id).take
    return 100 if assing.completed?
    answered = assing.results&.size || 0
    total = object.questions&.size
    return 0 if total.nil? || total == 0
    (100 * answered) / total
  end

  def clients_by_report_families
    # todo add end_level column
    client_ids = Client.by_report_family_assessment(object).enabled.roots.ids
    h.policy_scope(Client).end_level_of(client_ids).map { |c| [c.id, c.decorate.display_name_with_parent] }
  end
end
