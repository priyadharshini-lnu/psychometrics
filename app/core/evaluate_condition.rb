# frozen_string_literal: true

class EvaluateCondition < Rectify::Command
  attr_reader :operator, :left, :right

  def initialize(operator, operands = [])
    @left, @right = operands
    @operator = operator
  end

  def call
    return broadcast :invalid_operator unless respond_to?(operator)
    return broadcast :invalid_operands unless [left, right].reject(&:nil?).size == 2

    broadcast :ok, evaluate
  end

  def evaluate
    send(operator)
  end

  def equal_to
    @left == @right
  end

  def not_equal_to
    @left != @right
  end

  def less_than
    @left < @right
  end

  def less_than_or_equal
    @left <= @right
  end

  def greater_than
    @left > @right
  end

  def greater_than_or_equal
    @left >= @right
  end
end
