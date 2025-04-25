# frozen_string_literal: true

class AddDeloymentTaskForAdminTranslations < ActiveRecord::Migration[7.1]
  def change
    DeploymentTask.add( # rubocop:disable CustomRubocops/AvoidActiveRecordInMigrations
      'Add ENABLE_INTL_FOR_ADMINS env variable to enable admin translations,
     Add ADMIN_LOCALES env variable and fill with comma separated language codes to show'
    )
  end
end
