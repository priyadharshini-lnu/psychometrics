# frozen_string_literal: true

class BackfillCommunicationTemplateTranslationTenants < ActiveRecord::Migration[7.1]
  def up
    execute <<~SQL.squish
      UPDATE communication_template_translations
      SET tenant_id = communication_templates.tenant_id
      FROM communication_templates
      WHERE communication_template_translations.communication_template_id = communication_templates.id
        AND communication_template_translations.tenant_id IS NULL
    SQL
  end

  def down
    # No-op: we don't want to clear backfilled tenants on rollback
  end
end
