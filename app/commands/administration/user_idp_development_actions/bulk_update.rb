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

        broadcast :ok, {
          all_records: UserIdpDevelopmentAction.
            with_public_skills.
            where(user_idp_plan_id: user_idp_plan_id)
        }
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

        records_to_delete = UserIdpDevelopmentAction.
                            with_public_skills.
                            where(user_idp_plan_id: user_idp_plan_id).
                            includes(:development_action)
        cleanup_orphaned_development_actions(records_to_delete)

        UserIdpDevelopmentAction.where(user_idp_plan_id: user_idp_plan_id).delete_all
      end

      def process_development_actions_by_skill
        development_actions_by_skill = user_idp_development_actions.group_by { |action| action[:user_idp_skill_id] }

        development_actions_by_skill.each do |user_idp_skill_id, development_actions|
          next if user_idp_skill_id.blank?

          process_development_actions_by_skill_id(user_idp_skill_id, development_actions)
        end
      end

      def process_development_actions_by_skill_id(user_idp_skill_id, development_actions)
        return unless public_user_idp_skill?(user_idp_skill_id)

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

        records_to_delete = UserIdpDevelopmentAction.
                            with_public_skills.
                            where(id: ids_to_delete).
                            includes(:development_action)
        cleanup_orphaned_development_actions(records_to_delete)
      end

      def delete_unretained_development_actions(user_idp_skill_id, development_actions_to_upsert)
        retained_ids = development_actions_to_upsert.filter_map { |action| action[:id].presence }

        records_to_delete = UserIdpDevelopmentAction.
                            where(user_idp_skill_id: user_idp_skill_id, user_idp_plan_id: user_idp_plan_id).
                            where.not(id: retained_ids).
                            includes(:development_action)
        cleanup_orphaned_development_actions(records_to_delete)

        UserIdpDevelopmentAction.
          with_public_skills.
          where(user_idp_skill_id: user_idp_skill_id, user_idp_plan_id: user_idp_plan_id).
          where.not(id: retained_ids).
          delete_all
      end

      def cleanup_orphaned_development_actions(records_to_delete)
        return if records_to_delete.empty?

        deletable_da_ids = DevelopmentAction.
                           where(source_type: %w[custom
                                                 ai_generated], owner_type: 'UserIdpPlan', owner_id: user_idp_plan_id).
                           joins(:user_idp_development_actions).
                           where(user_idp_development_actions: { id: records_to_delete.select(:id) }).
                           distinct.
                           pluck(:id)

        return if deletable_da_ids.empty?

        retained_da_ids = UserIdpDevelopmentAction.
                          where(development_action_id: deletable_da_ids).
                          where.not(id: records_to_delete.select(:id)).
                          distinct.
                          pluck(:development_action_id)

        safe_to_delete_ids = deletable_da_ids - retained_da_ids

        DevelopmentAction.where(id: safe_to_delete_ids).destroy_all
      end

      def upsert_development_actions(development_actions_to_upsert)
        development_actions_to_update,
        development_actions_to_create = development_actions_to_upsert.partition do |action_data|
          action_data[:id].present?
        end

        development_actions_to_update.each do |action_data|
          update_existing_development_action(action_data)
        end

        development_actions_to_create.each do |action_data|
          create_new_development_action(action_data)
        end
      end

      def update_existing_development_action(action_data)
        record = UserIdpDevelopmentAction.find(action_data[:id])

        if record.development_action&.source_type != 'platform' && needs_development_action?(action_data)
          record.development_action.update!(
            name: action_data[:name].presence,
            description: action_data[:description],
            learning_style: action_data[:learning_style]
          )
        end

        clean_data = sanitize_development_action_data(action_data)
        record.update!(clean_data.except(:id))
      end

      def create_new_development_action(action_data)
        clean_data = sanitize_development_action_data(action_data).except(:id)

        if action_data[:development_action_id].present?
          UserIdpDevelopmentAction.create!(clean_data)
        elsif needs_development_action?(action_data)
          create_development_action_with_user_association(action_data)
        end
      end

      def create_development_action_with_user_association(action_data)
        source_type = action_data[:source_type] || 'platform'

        development_action = DevelopmentAction.create!(
          name: action_data[:name].presence,
          description: action_data[:description],
          learning_style: action_data[:learning_style],
          owner: user_idp_plan,
          source_type: source_type
        )

        UserIdpDevelopmentAction.create!(
          development_action: development_action,
          user_idp_plan_id: user_idp_plan_id,
          user_idp_skill_id: action_data[:user_idp_skill_id],
          progress: action_data[:progress],
          start_date_time: action_data[:start_date_time],
          end_date_time: action_data[:end_date_time],
          private: action_data[:private] || false
        )
      end

      def needs_development_action?(action_data)
        action_data[:description].present? && action_data[:learning_style].present?
      end

      def user_idp_plan
        @user_idp_plan ||= UserIdpPlan.find(user_idp_plan_id)
      end

      def sanitize_development_action_data(action_data)
        action_data.except(:_destroy, :name, :description, :learning_style, :source_type)
      end

      def public_user_idp_skill?(user_idp_skill_id)
        UserIdpSkill.public_skills.exists?(id: user_idp_skill_id)
      end
    end
  end
end
