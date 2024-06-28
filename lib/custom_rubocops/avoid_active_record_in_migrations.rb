# frozen_string_literal: true

if Object.const_defined?('RuboCop::Cop::Cop')
  module CustomRubocops
    class AvoidActiveRecordInMigrations < RuboCop::Cop::Cop
      MSG = 'Avoid using Active Record models in migrations.'

      def on_send(node)
        return unless in_migration_file?(processed_source.buffer.name)

        receiver, _, *_args = *node
        if active_record_model_usage?(receiver)
          add_offense(node, message: MSG)
        end
      end

      private

      def active_record_model_usage?(node)
        node&.const_type? && node.const_name.match?(/^[A-Z][a-zA-Z0-9]*$/)
      end

      def in_migration_file?(file_path)
        file_path.include?('/db/migrate/')
      end
    end
  end
else
  # rubocop:disable Lint/EmptyClass
  module CustomRubocops
    class AvoidActiveRecordInMigrations
    end
  end
  # rubocop:enable Lint/EmptyClass
end
