class NormDecorator < BaseDecorator
  def updater
    object.updater.full_name if object.updater
  end
end
