// Export Dashboard FILE API action

export const EXPORT_DASHBOARD_FILE = 'dashboards/EXPORT_FILE'

export const exportDashboardFile = (
  campaignId: string,
  projectId: string,
  dashboardId: string,
  dashboardType: string,
  reportId: string,
  datasetId: string,
  projectPath: string,
  format: 'PDF' | 'PPTX' = 'PDF',
  onlyCurrentTab: boolean,
  currentPageName: string | null = null,
) => ({
  type: EXPORT_DASHBOARD_FILE,
  request: {
    method: 'post',
    url: `/administration/dashboards/${dashboardId}/export_file`,
    body: {
      jobType: 'file_export',
      parameters: {
        campaignId,
        projectId,
        dashboardId,
        dashboardType,
        reportId,
        datasetId,
        projectPath,
        format,
        onlyCurrentTab,
        currentPageName,
      },
    },
    loader: true,
    contentType: 'application/json' as const,
  },
})
