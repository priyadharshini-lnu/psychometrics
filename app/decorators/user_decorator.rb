class UserDecorator < BaseDecorator
  def display_name
    return object.email if object.first_name.blank? && object.last_name.blank?
    "#{object.first_name} #{object.last_name}"
  end
end
