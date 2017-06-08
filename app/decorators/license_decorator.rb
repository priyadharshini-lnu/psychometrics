class LicenseDecorator < BaseDecorator
  def display_name
    object.report_family.decorate.display_name
  end

  def used_number(client = nil)
    if client.root?
      I18n.t('administration.clients.licenses.show.used_out_of', used_number: object.used_number - object.used_overuse_number, number: object.number)
    else
      object.license_usages.where(client_id: client.subtree_ids).size
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

  def usage_percent
    result = 0
    if object.used_number != result
      result = (object.used_number * 100 / object.number).round(1)
    end
    result.to_s + ' %'
  end
end
