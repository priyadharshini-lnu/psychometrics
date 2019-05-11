class DatasheetRowDecorator < BaseDecorator
  def display_name
    object.email
  end
end
