class CommunicationDecorator < BaseDecorator
  def display_name
    object.subject
  end
end
