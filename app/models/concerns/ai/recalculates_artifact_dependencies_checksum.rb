# frozen_string_literal: true

module AI
  module RecalculatesArtifactDependenciesChecksum
    extend ActiveSupport::Concern

    included do
      before_save  :capture_dependency_changes_for_checksum
      after_commit :update_campaign_artifacts_checksum, on: %i[update], if: -> { @dependencies_changed_for_checksum }
    end

    private

    def capture_dependency_changes_for_checksum
      @dependencies_changed_for_checksum =
        will_save_change_to_model_id? ||
        will_save_change_to_system_prompt? ||
        will_save_change_to_user_prompt? ||
        will_save_change_to_dependencies? ||
        assistant_output_schema_keys_changed_or_deleted?

      true
    end

    def assistant_output_schema_keys_changed_or_deleted?
      assistant_output_schema_keys.target.any? do |key|
        key.new_record? || key.marked_for_destruction? || key.changed?
      end
    end

    def update_campaign_artifacts_checksum
      campaign_ai_artifacts.find_each(&:recalculate_dependencies_checksum!)
    end
  end
end
