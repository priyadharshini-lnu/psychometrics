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

  def timing
    object.timing ? "- #{object.timing}" : ''
  end

  def anonym_link_for(client)
    hasids = Hashids.new(ENV['HASHIDS_SALT'], Settings.hashids_length.anonym)
    url = h.anonym_assessment_pass_url(client_id: hasids.encode(client.id),
                                       assessment_id: hasids.encode(object.id),
                                       domain: Settings.domain,
                                       subdomain: client.subdomain)
    h.link_to(url, url)
  end

  def clients_names
    object.clients.
      map { |client| client.decorate.display_name }.
      join(', ')
  end
end
