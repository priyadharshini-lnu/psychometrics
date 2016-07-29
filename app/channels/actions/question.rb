# Extend Pundit helper for use in administration namespace
module Actions
  module Question
    extend Actions::Action

    action :create do
      raise 'should be impl'
    end

    action :update do
      id = data.delete('id')
      ::Question.update(id, data)
    end

    action :destroy do
      raise 'should be impl'
    end

    action :rename do
      raise 'should be impl'
    end

    action :move_up do
      ::Question.find(data['id']).move_higher
    end

    action :move_down do
      ::Question.find(data['id']).move_lower
    end

    action :restore do
      raise 'should be impl'
    end

    action :permanent_destroy do
      raise 'should be impl'
    end

    action :add_comment do
      raise 'should be impl'
    end

    action :remove_comment do
      raise 'should be impl'
    end
  end
end
