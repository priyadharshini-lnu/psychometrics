# Extend Pundit helper for use in administration namespace
module Actions
  module Block
    extend Actions::Action

    action :create do
      # data
      # Block.new(data.data)
      # send
      {a: 1}
    end

    action :update do
    end

    action :destroy do

    end

    action :rename do

    end

    action :move_up do

    end

    action :move_down do

    end

    action :restore do

    end

    action :permanent_destroy do

    end

  end
end
