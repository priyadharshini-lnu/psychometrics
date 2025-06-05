# frozen_string_literal: true

module Administration
  module UserIdpDevelopmentActions
    class BulkUpdate < BaseCommand
      attr_reader :user_idp_development_actions, :user_idp_plan_id

      def initialize(user_idp_development_actions: [], user_idp_plan_id: nil)
        @user_idp_development_actions = user_idp_development_actions
        @user_idp_plan_id = user_idp_plan_id
      end

      def call
        if should_delete_all_development_actions?
          delete_all_development_actions_for_plan
        else
          process_development_actions_by_skill
        end

        broadcast :ok, { all_records: UserIdpDevelopmentAction.where(user_idp_plan_id: user_idp_plan_id) }
      rescue ActiveRecord::RecordInvalid => e
        broadcast :invalid, e.message
      rescue ActiveRecord::RecordNotFound => e
        broadcast :not_found, e.message
      end

      private

      def should_delete_all_development_actions?
        user_idp_development_actions.empty? ||
          user_idp_development_actions.all? { |action| destroy_flagged?(action) }
      end

      def destroy_flagged?(action)
        ActiveModel::Type::Boolean.new.cast(action[:_destroy])
      end

      def delete_all_development_actions_for_plan
        return if user_idp_plan_id.blank?

        UserIdpDevelopmentAction.
          where(user_idp_plan_id: user_idp_plan_id).
          delete_all
      end

      def process_development_actions_by_skill
        development_actions_by_skill = user_idp_development_actions.group_by { |action| action[:user_idp_skill_id] }

        development_actions_by_skill.each do |user_idp_skill_id, development_actions|
          next if user_idp_skill_id.blank?

          process_development_actions_by_skill_id(user_idp_skill_id, development_actions)
        end
      end

      def process_development_actions_by_skill_id(user_idp_skill_id, development_actions)
        development_actions_for_deletion,
         development_actions_to_upsert = partition_development_actions(development_actions)

        delete_specific_development_actions(development_actions_for_deletion)
        delete_unretained_development_actions(user_idp_skill_id, development_actions_to_upsert)
        upsert_development_actions(development_actions_to_upsert)
      end

      def partition_development_actions(development_actions)
        development_actions.partition { |action| destroy_flagged?(action) }
      end

      def delete_specific_development_actions(development_actions_for_deletion)
        return if development_actions_for_deletion.empty?

        ids_to_delete = development_actions_for_deletion.filter_map { |action_data| action_data[:id].presence }
        return if ids_to_delete.empty?

        UserIdpDevelopmentAction.where(id: ids_to_delete).delete_all
      end

      def delete_unretained_development_actions(user_idp_skill_id, development_actions_to_upsert)
        retained_ids = development_actions_to_upsert.filter_map { |action| action[:id].presence }

        UserIdpDevelopmentAction.
          where(user_idp_skill_id: user_idp_skill_id).
          where.not(id: retained_ids).
          delete_all
      end

      def upsert_development_actions(development_actions_to_upsert)
        development_actions_to_update,
        development_actions_to_create = development_actions_to_upsert.partition do |action_data|
          action_data[:id].present?
        end

        records_by_id = UserIdpDevelopmentAction.where(id: development_actions_to_update.pluck(:id)).index_by(&:id)

        development_actions_to_update.each do |action_data|
          record = records_by_id[action_data[:id]]
          next if record.blank?

          clean_data = sanitize_development_action_data(action_data)
          record.update!(clean_data.except(:id))
        end

        development_actions_to_create.each do |action_data|
          create_new_development_action(action_data)
        end
      end

      def create_new_development_action(action_data)
        clean_data = sanitize_development_action_data(action_data).except(:id)
        UserIdpDevelopmentAction.create!(clean_data)
      end

      def sanitize_development_action_data(action_data)
        action_data.except(:_destroy)
      end
    end
  end
end
