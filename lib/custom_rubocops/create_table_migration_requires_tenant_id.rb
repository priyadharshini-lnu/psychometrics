# frozen_string_literal: true

if Object.const_defined?('RuboCop::Cop::Cop')
  module CustomRubocops
    class CreateTableMigrationRequiresTenantId < RuboCop::Cop::Base
      MSG = 'Table `%<table>s` is missing a `tenant_id` column. ' \
            'All tables must include `tenant_id` for multi-tenancy. ' \
            'If this table cannot derive a client for some reason, disable this cop and add a comment explaining why.'

      def on_new_investigation
        path = processed_source.path
        @in_migration = path.include?('db/migrate') && migration_after_cutoff?(path)
      end

      def on_send(node)
        return unless @in_migration
        return unless create_table_call?(node)

        table_name = node.arguments.first&.value&.to_s || 'unknown'

        block_node = node.parent
        return unless block_node&.block_type?

        unless has_tenant_id_column?(block_node)
          add_offense(node, message: format(MSG, table: table_name))
        end
      end

      private

      def migration_after_cutoff?(path)
        cutoff = cop_config['EnforcedFromMigration'].to_s
        return true if cutoff.empty?

        migration_timestamp = File.basename(path)[/\A(\d+)_/, 1]
        return true if migration_timestamp.nil?

        migration_timestamp.to_i > cutoff.to_i
      end

      def create_table_call?(node)
        node.method_name == :create_table && node.receiver.nil?
      end

      def has_tenant_id_column?(block_node)
        block_node.each_descendant(:send).any? do |send_node|
          column_name = send_node.arguments.first
          (column_name&.sym_type? && column_name.value == :tenant_id) ||
            (column_name&.str_type? && column_name.value == 'tenant_id')
        end
      end
    end
  end
else
  # rubocop:disable Lint/EmptyClass
  module CustomRubocops
    class CreateTableMigrationRequiresTenantId
    end
  end
  # rubocop:enable Lint/EmptyClass
end
