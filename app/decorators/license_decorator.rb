class LicenseDecorator < BaseDecorator
  def display_name
    return object.type if object.type_threesixty?

    object.report_family.decorate.display_name
  end

  def used_number(client = nil)
    if client.root?
      I18n.t('administration.clients.licenses.show.used_out_of', used_number: object.used_number - object.used_overuse_number, number: object.number)
    else
      object.used_by(client)
    end
  end

  def used_overuse_number
    I18n.t('administration.clients.licenses.show.used_out_of', used_number: object.used_overuse_number, number: object.overuse_number)
  end

  def start_date
    object.start_date.strftime('%d %b %Y')
  end

  def end_date
    object.end_date.strftime('%d %b %Y')
  end

  def usage_percent(client = nil)
    used_number = object.used_by(client) if client
    used_number ||= object.used_number
    used_number = (used_number * 100 / object.number).round(0) if used_number > 0
    used_number.to_s + ' %'
  end

  def toggle_status_confirmation
    status = object.disabled ? I18n.t('administration.enable') : I18n.t('administration.disable')
    {
        title: I18n.t(
            "administration.clients.licenses.resource.confirmations.toggle_status.title",
            status: status,
            name: display_name
        ),
        body: I18n.t(
            "administration.clients.licenses.resource.confirmations.toggle_status.body",
            status: status.downcase
        )
    }.to_json
  end
end
