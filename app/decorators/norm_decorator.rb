class NormDecorator < BaseDecorator
  def updater
    object.updater.decorate.display_name
  end
end
