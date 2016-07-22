class NormDecorator < BaseDecorator
  def updater
    object.updater.try(:full_name)
  end
end
