class CommunicationDecorator < BaseDecorator
  def display_name
    object.subject
  end

  def form_url
    if object.new_record?
      helpers.new_form_administration_communications_path
    else
      helpers.edit_form_administration_communication_path(object)
    end
  end
end
