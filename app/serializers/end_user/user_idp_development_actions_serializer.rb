# frozen_string_literal: true

module EndUser
  class UserIdpDevelopmentActionsSerializer < Panko::Serializer
    attributes :id, :development_action_id, :name, :description, :learning_style,
               :image, :user_idp_skill_id, :progress, :start_date_time, :end_date_time, :private, :source_type

    delegate :name, :description, :learning_style, :source_type, to: :development_action

    def development_action_id
      development_action&.id
    end

    def image
      development_action&.image&.url
    end

    def start_date_time
      format_datetime(object.start_date_time)
    end

    def end_date_time
      format_datetime(object.end_date_time)
    end

    private

    def development_action
      object.development_action
    end

    def format_datetime(datetime)
      datetime&.strftime('%Y-%m-%d %H:%M')
    end
  end
end
