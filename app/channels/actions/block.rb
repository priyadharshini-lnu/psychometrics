# Extend Pundit helper for use in administration namespace
module Actions
  module Block
    extend Actions::Action

    action :create do
      puts "create"
    end

    action :update do

    end

  end
end
