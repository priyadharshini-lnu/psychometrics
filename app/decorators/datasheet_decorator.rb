class DatasheetDecorator < BaseDecorator
  def display_name
    object.filename
  end
end
