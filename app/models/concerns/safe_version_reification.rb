# frozen_string_literal: true

module SafeVersionReification
  extend ActiveSupport::Concern

  included do # rubocop:disable Metrics/BlockLength
    def safe_reify(version_or_index = nil, options = {})
      version = version_or_index.is_a?(Integer) ? versions[version_or_index] : version_or_index
      return nil unless version

      default_options = {
        has_many: false,
        has_one: false,
        belongs_to: true,
        mark_for_destruction: false,
        dup: false
      }

      merged_options = default_options.merge(options)

      if merged_options[:has_many] && self.class.filtered_associations.any?
        merged_options[:has_many] = build_has_many_associations_for_reify
      end

      reified = version.reify(merged_options)
      return nil unless reified

      if options[:has_many]
        mark_reified_associations_as_persisted(reified)
      end

      reified
    rescue ActiveRecord::RecordNotFound, PaperTrail::Error => e
      Rails.logger.warn("SafeVersionReification: Failed to reify #{self.class.name}##{id} - #{e.message}")
      nil
    end

    def rollback_to_version!(version_or_index = nil)
      version = version_or_index.is_a?(Integer) ? versions[version_or_index] : version_or_index
      return false unless version

      transaction do
        rollback_has_many_associations(version)
        reified_attributes = version.reify(has_many: false, has_one: false, belongs_to: false)
        unless reified_attributes
          raise ActiveRecord::Rollback
        end

        assign_attributes(reified_attributes.attributes.except('id'))
        save!
      end

      reload
      true
    rescue StandardError => e
      Rails.logger.error("SafeVersionReification: Failed to rollback #{self.class.name}##{id} - #{e.message}")
      false
    end

    private

    def build_has_many_associations_for_reify
      filtered = self.class.filtered_associations

      self.class.reflect_on_all_associations(:has_many).filter_map do |association|
        next if filtered.include?(association.name.to_sym)
        next if association.options[:through].present?
        next if association.name == :versions

        association.name
      end
    end

    def mark_reified_associations_as_persisted(reified) # rubocop:disable Metrics/PerceivedComplexity, Metrics/CyclomaticComplexity
      self.class.reflect_on_all_associations(:has_many).each do |association|
        next if association.options[:through].present?
        next if association.name == :versions

        if skip_association_reification?(association)
          reified.association(association.name).reset
          next
        end

        next unless association.klass.respond_to?(:paper_trail)

        reified_records = reified.send(association.name).to_a
        expected_ids = reified_records.filter_map(&:id)
        current_ids = send(association.name).pluck(:id)

        ids_to_remove = current_ids - expected_ids

        if expected_ids.any?
          persisted_records = association.klass.where(id: expected_ids).index_by(&:id)

          final_records = reified_records.map do |record|
            persisted_records[record.id] || record
          end

          reified.send(:"#{association.name}=", final_records)
        else
          reified.send(:"#{association.name}=", [])
        end

        if ids_to_remove.any?
          association.klass.where(id: ids_to_remove).destroy_all
        end
      end
    end

    def skip_association_reification?(association)
      filtered_association_names = self.class.filtered_associations
      filtered_association_names.include?(association.name.to_sym)
    end

    def rollback_has_many_associations(version)
      return unless version.respond_to?(:version_associations)

      version_associations_by_name = build_version_associations_map(version)

      self.class.reflect_on_all_associations(:has_many).each do |association|
        next if skip_association_for_rollback?(association)

        rollback_association(association, version_associations_by_name)
      end
    end

    def skip_association_for_rollback?(association)
      return true if skip_association_reification?(association)
      return true if association.options[:through].present?
      return true if association.name == :versions

      !association.klass.respond_to?(:paper_trail)
    end

    def build_version_associations_map(version)
      version_associations_map = {}

      version.version_associations.each do |va|
        association_name = find_association_name_for_class(va.foreign_type || version.item_type)
        next unless association_name

        version_associations_map[association_name] ||= []
        version_associations_map[association_name] << va.foreign_key_id
      end

      version_associations_map
    end

    def find_association_name_for_class(klass_name)
      self.class.reflect_on_all_associations(:has_many).find do |assoc|
        assoc.klass.name == klass_name && !skip_association_for_rollback?(assoc)
      end&.name
    end

    def rollback_association(association, version_associations_by_name)
      expected_ids = version_associations_by_name[association.name] || []
      current_ids = send(association.name).pluck(:id)
      ids_to_remove = current_ids - expected_ids

      association.klass.where(id: ids_to_remove).destroy_all if ids_to_remove.any?
    end
  end

  class_methods do
    def filtered_associations(*names)
      if names.any?
        @filtered_associations ||= []
        @filtered_associations += names.flatten.map(&:to_sym)
      end
      @filtered_associations || []
    end
  end
end
