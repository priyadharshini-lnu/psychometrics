class UserDecorator < BaseDecorator
  def display_name
    "#{object.first_name} #{object.last_name}"
  end
end
