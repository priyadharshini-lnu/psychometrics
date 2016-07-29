module Actions
  module Block
    extend Actions::Action

    action :create do |data, current_administrator, assessment|
      # data
      # Block.new(data.data)
      # send
      Rails.logger.warn "current_administrator #{current_administrator}"
      Rails.logger.warn "data #{data}"
      Rails.logger.warn "@assessment #{assessment.inspect}"
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
