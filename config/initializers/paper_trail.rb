# frozen_string_literal: true

PaperTrail.config.track_associations = true

Rails.application.config.to_prepare do
  PaperTrail::Version.include(Tenantable)
  PaperTrail::Version.tenant_source :item

  PaperTrail::VersionAssociation.include(Tenantable)
  PaperTrail::VersionAssociation.tenant_source :version
end

module PaperTrailAssociationTracking
  module Reifiers
    module HasMany
      class << self
        private

        def load_versions_for_hm_association(assoc, model, version_table, tx_id, version_at)
          sti_model_names = model.class.ancestors.
                            select { |x| x <= model.class.base_class && x.method_defined?(assoc.name) }.
                            map(&:name)
          version_table_name = model.class.connection.quote_table_name(version_table)

          version_ids = model.class.paper_trail.version_association_class.
                        joins(model.class.version_association_name).
                        select('MIN(version_id) as version_id').
                        where(foreign_key_name: assoc.foreign_key).
                        where(foreign_key_id: model.id).
                        where(foreign_type: sti_model_names + [nil]).
                        where(Arel.sql("#{version_table_name}.item_type = ?"), assoc.klass.base_class.name).
                        where(
                          Arel.sql(
                            "#{version_table_name}.created_at >= ? OR " \
                            "#{version_table_name}.transaction_id = ?"
                          ),
                          version_at,
                          tx_id
                        ).
                        group('item_id').
                        map(&:version_id)

          versions_by_id(model.class, version_ids)
        end
      end
    end
  end
end
