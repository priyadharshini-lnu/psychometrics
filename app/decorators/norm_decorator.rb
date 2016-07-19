class NormDecorator < BaseDecorator
  def updater
    object.updater.full_name
  end
end
