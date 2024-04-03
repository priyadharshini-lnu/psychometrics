# frozen_string_literal: true

module EndUser
  class UserIdpDevelopmentActionsSerializer < Panko::Serializer
    attributes :id, :development_action_id, :name, :description, :learning_style, :image, :user_idp_skill_id,
               :custom_action, :progress, :start_date_time, :end_date_time, :private

    def development_action_id
      development_action&.id
    end

    def name
      development_action&.name
    end

    def description
      development_action&.description
    end

    def learning_style
      development_action&.learning_style
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
      datetime.strftime('%Y-%m-%d %H:%M')
    end
  end
end
