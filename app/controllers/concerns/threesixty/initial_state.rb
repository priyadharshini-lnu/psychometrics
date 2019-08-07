module ::Threesixty::InitialState
  extend ActiveSupport::Concern

  included do
    def self.initial_state_for actions
      actions = actions.is_a?(Array) ? actions : [actions]
      before_action :set_init_state, only: actions, if: -> { request.format.html? }
    end
  end

  def set_init_state
    @init_state = {
      threeSixtyCampaign: {
        temp: {
          project: {
            logo: @current_project.logo.url
          },
          currentUser: serialized_current_user
        }
      }
    }
  end

  def serialized_current_user
    ::Threesixty::CurrentUserSerializer.new(current_user).
      as_json.
      deep_transform_keys! { |key| key.to_s.camelize(:lower) }
  end

end
