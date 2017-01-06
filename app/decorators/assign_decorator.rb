class AssignDecorator < BaseDecorator

  def created_at
    I18n.l object.created_at, format: :date
  end

  def display_name
    'Assign'
  end
end
