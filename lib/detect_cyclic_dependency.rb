# frozen_string_literal: true

class DetectCyclicDependency < BaseCommand
  attr_reader :dependency_hash

  def initialize(dependency_hash)
    @dependency_hash = dependency_hash
  end

  def call
    broadcast :ok, has_cycle_and_path?(dependency_hash)
  end

  def has_cycle_and_path?(dependency_hash)
    visited = {}
    recursion_stack = {}
    cyclic_path = []

    dependency_hash.each_key do |node|
      if !visited[node] && detect_cycle_util(node, dependency_hash, visited, recursion_stack, cyclic_path)
        return true, cyclic_path
      end
    end

    [false, []]
  end

  def detect_cycle_util(node, dependency_hash, visited, recursion_stack, cyclic_path)
    return false unless dependency_hash[node]

    visited[node] = true
    recursion_stack[node] = true
    cyclic_path.push(node)

    dependency_hash[node].each do |neighbor|
      if !visited[neighbor] && detect_cycle_util(neighbor, dependency_hash, visited, recursion_stack, cyclic_path)
        return true
      elsif recursion_stack[neighbor]
        cyclic_path.push(neighbor)
        return true
      end
    end

    recursion_stack[node] = false
    cyclic_path.pop
    false
  end
end
