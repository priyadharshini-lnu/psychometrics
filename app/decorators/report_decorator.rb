class ReportDecorator < BaseDecorator
  def type
    I18n.t("administration.reports.types.#{object.type}")
  end

  def client_name
    object.owner.try(:name) || I18n.t('administration.tte')
  end
end
