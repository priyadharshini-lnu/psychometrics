class NormDecorator < BaseDecorator
  def updater
    object.updater.try(:decorate).try(:display_name)
  end
end
