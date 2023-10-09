# frozen_string_literal: true

module EndUser
  class CurrentUserSerializer < ActiveModel::Serializer
    attributes :id, :email, :first_name, :last_name, :full_name, :role,
               :is_anonym, :photo, :timezone, :custom_fields,
               :age, :gender, :locale, :profile_completion_percentage, :last_sign_in_at, :updated_at,
               :update_profile_required, :update_profile_message, :back_url

    def updated_at
      object.user_profile.updated_at
    end

    def back_url
      instance_options[:back_url]
    end

    def update_profile_required
      return false unless object.project

      update_in = object.project.profile_setting.update_in
      return true if Users::ProfileCompletion.call!(object) < 100
      return false unless update_in

      (Time.current - object.user_profile.updated_at) > update_in.month
    end

    def update_profile_message
      return I18n.t('profile.incomplete') if Users::ProfileCompletion.call!(object) < 100

      update_in = object.project.profile_setting.update_in || 9999
      updated_at = object.user_profile.updated_at
      if (Time.current - updated_at) > update_in.month
        update_in_time = update_in.month.ago
        diff = (update_in_time.month - updated_at.month) + (12 * (update_in_time.year - updated_at.year))
        I18n.t('profile.old_data', months: diff.positive? ? diff : 1)
      end
    end

    def profile_completion_percentage
      Users::ProfileCompletion.call!(object)
    end

    delegate(*UserProfile::PROFILE_FIELDS, :custom_fields, to: :user_profile)

    def photo
      object.user_profile.photo&.url
    end

    def full_name
      object.decorate.full_name
    end

    private

    def user_profile
      object.user_profile
    end

    def current_project_id
      instance_options[:project_id]
    end
  end
end
