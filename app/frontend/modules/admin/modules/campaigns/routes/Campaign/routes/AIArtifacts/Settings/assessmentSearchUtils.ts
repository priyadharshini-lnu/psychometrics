export const getAvailableAssessments = (
  assessments: Array<{ id: string | number; name: string }>,
  selectedIds: Set<string>,
  currentId?: string,
): Array<{ id: string | number; name: string }> => assessments.filter((assessment) => {
  const assessmentIdString = assessment.id.toString()
  // Allow if not selected OR if it's the current assessment being edited
  return !selectedIds.has(assessmentIdString) || assessmentIdString === currentId
})
